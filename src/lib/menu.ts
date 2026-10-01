import type {
  CartLine,
  Category,
  Customer,
  Dish,
  Fulfillment,
  Payment,
  Store,
} from "@/lib/types";

export const FOOD_IMAGES = [
  "/menu/tarta-jamon.jpg",
  "/menu/tarta-acelga.jpg",
  "/menu/tarta-atun.jpg",
  "/menu/tarta-entera.jpg",
  "/menu/canelones.jpg",
  "/menu/pastel-papa.jpg",
  "/menu/lasana.jpg",
  "/menu/empanadas.jpg",
  "/menu/pollo-crema.jpg",
  "/menu/milanesa.jpg",
  "/menu/carne-horno.jpg",
  "/menu/pollo-disco.jpg",
  "/menu/ensalada.jpg",
  "/menu/flan.jpg",
  "/menu/budin.jpg",
  "/menu/torta-ricota.jpg",
] as const;

export const COVER_IMAGES = ["/menu/hero.jpg", ...FOOD_IMAGES] as const;

const IMAGE_PATH = /^\/menu\/[a-zA-Z0-9._-]+$/;
const ID_PATTERN = /^[a-zA-Z0-9-]{1,40}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function money(value: unknown, max: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number) || number < 0 || number > max) return null;
  return Math.round(number);
}

function imagePath(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !IMAGE_PATH.test(value)) {
    throw new Error("Hay una imagen con una ruta inválida.");
  }
  return value;
}

export function parseStore(input: unknown): Store {
  if (!isRecord(input)) throw new Error("La carta no tiene un formato válido.");

  const name = text(input.name, 60);
  const whatsapp = text(input.whatsapp, 20).replace(/\D/g, "");
  if (!name) throw new Error("Falta el nombre del local.");
  if (whatsapp.length < 8 || whatsapp.length > 15) {
    throw new Error(
      "El WhatsApp va con código de país, solo números. Ejemplo: 5491112345678.",
    );
  }
  if (!Array.isArray(input.categories) || !Array.isArray(input.dishes)) {
    throw new Error("Faltan categorías o platos.");
  }

  const pickupEnabled = input.pickupEnabled !== false;
  const deliveryEnabled = input.deliveryEnabled !== false;
  if (!pickupEnabled && !deliveryEnabled) {
    throw new Error("Tenés que ofrecer retiro o delivery.");
  }

  const categories: Category[] = input.categories.map((item, index) => {
    if (!isRecord(item)) throw new Error("Hay una categoría inválida.");
    const id = text(item.id, 40);
    const categoryName = text(item.name, 40);
    const sort = Number(item.sort);
    if (!ID_PATTERN.test(id) || !categoryName) {
      throw new Error("Cada categoría necesita un nombre.");
    }
    return { id, name: categoryName, sort: Number.isFinite(sort) ? sort : index };
  });
  categories.sort((a, b) => a.sort - b.sort);
  categories.forEach((category, index) => {
    category.sort = index;
  });

  if (new Set(categories.map((category) => category.id)).size !== categories.length) {
    throw new Error("Hay categorías repetidas.");
  }

  const categoryIds = new Set(categories.map((category) => category.id));
  const counters = new Map<string, number>();
  const dishes: Dish[] = input.dishes.map((item) => {
    if (!isRecord(item)) throw new Error("Hay un plato inválido.");
    const id = text(item.id, 40);
    const categoryId = text(item.categoryId, 40);
    const dishName = text(item.name, 80);
    const price = money(item.price, 2_000_000);
    if (!ID_PATTERN.test(id) || !dishName) {
      throw new Error("Cada plato necesita un nombre.");
    }
    if (!categoryIds.has(categoryId)) {
      throw new Error(`"${dishName}" está en una categoría que no existe.`);
    }
    if (price == null) throw new Error(`El precio de "${dishName}" no es válido.`);
    const sort = Number(item.sort);
    return {
      id,
      categoryId,
      name: dishName,
      description: text(item.description, 240),
      price,
      image: imagePath(item.image),
      available: item.available !== false,
      sort: Number.isFinite(sort) ? sort : 0,
    };
  });
  const categoryOrder = new Map(categories.map((category, index) => [category.id, index]));
  dishes.sort(
    (a, b) =>
      (categoryOrder.get(a.categoryId) ?? 0) - (categoryOrder.get(b.categoryId) ?? 0) ||
      a.sort - b.sort,
  );
  dishes.forEach((dish) => {
    const sort = counters.get(dish.categoryId) ?? 0;
    counters.set(dish.categoryId, sort + 1);
    dish.sort = sort;
  });

  if (new Set(dishes.map((dish) => dish.id)).size !== dishes.length) {
    throw new Error("Hay platos repetidos.");
  }

  const deliveryFee = money(input.deliveryFee, 200_000);
  const deliveryMin = money(input.deliveryMin, 2_000_000);
  if (deliveryFee == null || deliveryMin == null) {
    throw new Error("El envío o el mínimo de delivery no es válido.");
  }

  const cover = imagePath(input.cover) ?? "/menu/hero.jpg";

  return {
    name,
    tagline: text(input.tagline, 140),
    cover,
    whatsapp,
    address: text(input.address, 160),
    hours: text(input.hours, 160),
    about: text(input.about, 400),
    open: input.open === true,
    pickupEnabled,
    deliveryEnabled,
    deliveryFee,
    deliveryMin,
    paymentNote: text(input.paymentNote, 240),
    categories,
    dishes,
  };
}

export function formatArs(value: number) {
  const formatted = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  return `$${formatted}`;
}

export function quote(store: Pick<Store, "deliveryFee">, lines: CartLine[], mode: Fulfillment) {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const fee = mode === "delivery" ? store.deliveryFee : 0;
  return { subtotal, fee, total: subtotal + fee, count: lines.reduce((sum, line) => sum + line.qty, 0) };
}

export function groupedMenu(store: Store, query: string) {
  const needle = query.trim().toLocaleLowerCase("es");
  return store.categories
    .slice()
    .sort((a, b) => a.sort - b.sort)
    .map((category) => ({
      category,
      dishes: store.dishes
        .filter((dish) => dish.categoryId === category.id && dish.available)
        .filter((dish) => {
          if (!needle) return true;
          return `${dish.name} ${dish.description}`.toLocaleLowerCase("es").includes(needle);
        })
        .sort((a, b) => a.sort - b.sort),
    }))
    .filter((group) => group.dishes.length > 0);
}

export function validateCustomer(
  store: Store,
  lines: CartLine[],
  mode: Fulfillment,
  customer: Customer,
) {
  if (!store.open) return "Ahora no estamos tomando pedidos.";
  if (!lines.length) return "El pedido está vacío.";
  if (mode === "delivery" && !store.deliveryEnabled) return "Hoy no hacemos delivery.";
  if (mode === "pickup" && !store.pickupEnabled) return "Hoy no hay retiro en el local.";
  if (customer.name.trim().length < 2) return "Decinos tu nombre.";
  if (customer.phone.replace(/\D/g, "").length < 8) return "Falta un teléfono para confirmar.";
  if (mode === "delivery" && customer.address.trim().length < 6) {
    return "Falta la dirección de entrega.";
  }
  const { subtotal } = quote(store, lines, mode);
  if (mode === "delivery" && subtotal < store.deliveryMin) {
    return `El mínimo para delivery es ${formatArs(store.deliveryMin)}.`;
  }
  return null;
}

export function buildOrderMessage(
  store: Store,
  lines: CartLine[],
  mode: Fulfillment,
  customer: Customer,
) {
  const { subtotal, fee, total } = quote(store, lines, mode);
  const payment: Record<Payment, string> = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
  };
  const items = lines.flatMap((line) => {
    const row = `• ${line.qty} × ${line.name} — ${formatArs(line.price * line.qty)}`;
    return line.note ? [row, `  ${line.note}`] : [row];
  });

  const message = [
    `Hola, quiero pedir en ${store.name}.`,
    "",
    mode === "delivery" ? "*Modalidad:* Delivery" : "*Modalidad:* Retiro en el local",
    `*Nombre:* ${customer.name.trim()}`,
    `*Teléfono:* ${customer.phone.trim()}`,
  ];

  if (mode === "delivery") message.push(`*Dirección:* ${customer.address.trim()}`);
  if (customer.when.trim()) message.push(`*Horario:* ${formatWhen(customer.when)}`);

  message.push(
    "",
    ...items,
    "",
    `*Subtotal:* ${formatArs(subtotal)}`,
    fee > 0 ? `*Envío:* ${formatArs(fee)}` : "*Envío:* sin cargo",
    `*Total:* ${formatArs(total)}`,
    `*Pago:* ${payment[customer.payment]}`,
  );

  if (customer.note.trim()) message.push(`*Nota:* ${customer.note.trim()}`);
  return message.join("\n");
}

export function formatWhen(value: string) {
  const specific = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}:\d{2}))?$/);
  if (!specific) return value.trim();
  const date = new Date(Number(specific[1]), Number(specific[2]) - 1, Number(specific[3]));
  const label = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return specific[4] ? `${label}, ${specific[4]}` : label;
}

export function whatsappUrl(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function isCartLine(value: unknown): value is CartLine {
  if (!isRecord(value)) return false;
  return (
    typeof value.lineId === "string" &&
    typeof value.dishId === "string" &&
    typeof value.name === "string" &&
    typeof value.price === "number" &&
    typeof value.qty === "number" &&
    value.qty > 0 &&
    typeof value.note === "string"
  );
}
