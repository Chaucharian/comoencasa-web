"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CupSoda, GlassWater, House, MessageCircle, Minus, Plus, Search, Wine, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import {
  buildOrderMessage,
  formatArs,
  formatWhen,
  groupedMenu,
  isCartLine,
  quote,
  validateCustomer,
  whatsappUrl,
} from "@/lib/menu";
import type { CartLine, Customer, Dish, Fulfillment, Store } from "@/lib/types";

const fieldClass =
  "h-12 w-full rounded-2xl border border-border bg-card px-4 text-base outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/30";

const emptyCustomer: Customer = {
  name: "",
  phone: "",
  address: "",
  when: "",
  payment: "efectivo",
  note: "",
};

const storageListeners = new Map<string, Set<() => void>>();

function subscribeStored(key: string, onChange: () => void) {
  const set = storageListeners.get(key) ?? new Set<() => void>();
  storageListeners.set(key, set);
  set.add(onChange);
  return () => set.delete(onChange);
}

function writeStored(key: string, value: string, area: Storage) {
  area.setItem(key, value);
  storageListeners.get(key)?.forEach((listener) => listener());
}

function useStored(key: string, area: "session" | "local") {
  return useSyncExternalStore(
    (onChange) => subscribeStored(key, onChange),
    () => {
      try {
        return (area === "session" ? sessionStorage : localStorage).getItem(key) ?? "";
      } catch {
        return "";
      }
    },
    () => "",
  );
}

function parseCart(raw: string, store: Store) {
  const fallback = { lines: [] as CartLine[], mode: defaultMode(store) };
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as { lines?: unknown; mode?: unknown };
    const lines = Array.isArray(parsed.lines) ? parsed.lines.filter(isCartLine) : [];
    const mode: Fulfillment =
      parsed.mode === "delivery" && store.deliveryEnabled
        ? "delivery"
        : parsed.mode === "pickup" && store.pickupEnabled
          ? "pickup"
          : fallback.mode;
    return { lines, mode };
  } catch {
    return fallback;
  }
}

function parseCustomer(raw: string): Customer {
  if (!raw) return emptyCustomer;
  try {
    const parsed = JSON.parse(raw) as Partial<Customer>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      address: typeof parsed.address === "string" ? parsed.address : "",
      when: typeof parsed.when === "string" ? parsed.when : "",
      payment: parsed.payment === "transferencia" ? "transferencia" : "efectivo",
      note: typeof parsed.note === "string" ? parsed.note : "",
    };
  } catch {
    return emptyCustomer;
  }
}

function defaultMode(store: Store): Fulfillment {
  if (store.pickupEnabled) return "pickup";
  return "delivery";
}

function DrinkMark({ name }: { name: string }) {
  const Icon = /vino/i.test(name) ? Wine : /gaseosa/i.test(name) ? CupSoda : GlassWater;
  return (
    <span className="grid size-[4.5rem] shrink-0 place-items-center rounded-2xl bg-muted text-accent">
      <Icon className="size-5" aria-hidden />
    </span>
  );
}

function Stepper({
  qty,
  label,
  onChange,
}: {
  qty: number;
  label: string;
  onChange: (qty: number) => void;
}) {
  return (
    <div className="flex items-center rounded-full bg-muted">
      <button
        type="button"
        className="grid size-9 place-items-center"
        aria-label={`Sacar uno de ${label}`}
        onClick={() => onChange(qty - 1)}
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-5 text-center text-sm font-semibold tabular-nums">{qty}</span>
      <button
        type="button"
        className="grid size-9 place-items-center"
        aria-label={`Sumar uno de ${label}`}
        onClick={() => onChange(qty + 1)}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function MenuApp({ store }: { store: Store }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(store.categories[0]?.id ?? "");
  const cartRaw = useStored("cec-cart", "session");
  const customerRaw = useStored("cec-customer", "local");
  const { lines, mode } = useMemo(() => parseCart(cartRaw, store), [cartRaw, store]);
  const customer = useMemo(() => parseCustomer(customerRaw), [customerRaw]);
  const [dishId, setDishId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [panel, setPanel] = useState<"cart" | "checkout" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const lock = useRef(false);

  const groups = useMemo(() => groupedMenu(store, query), [store, query]);
  const dish = store.dishes.find((item) => item.id === dishId) ?? null;
  const totals = quote(store, lines, mode);
  const plainQty = (id: string) => lines.find((line) => line.dishId === id && !line.note)?.qty ?? 0;

  function saveCart(nextLines: CartLine[], nextMode: Fulfillment) {
    writeStored("cec-cart", JSON.stringify({ lines: nextLines, mode: nextMode }), sessionStorage);
  }

  function saveCustomer(next: Customer) {
    writeStored("cec-customer", JSON.stringify(next), localStorage);
  }

  useEffect(() => {
    if (query) return;
    const onScroll = () => {
      if (lock.current) return;
      const marker = 180;
      let current = groups[0]?.category.id ?? "";
      for (const group of groups) {
        const node = document.getElementById(`cat-${group.category.id}`);
        if (node && node.getBoundingClientRect().top <= marker) current = group.category.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [groups, query]);

  useEffect(() => {
    if (!active) return;
    document.getElementById(`chip-${active}`)?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);

  function jump(id: string) {
    lock.current = true;
    setActive(id);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(`cat-${id}`)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(() => {
      lock.current = false;
    }, 800);
  }

  function setLineQty(lineId: string, next: number) {
    saveCart(
      next <= 0 ? lines.filter((line) => line.lineId !== lineId) : lines.map((line) => (line.lineId === lineId ? { ...line, qty: next } : line)),
      mode,
    );
  }

  function addPlain(item: Dish, amount = 1) {
    if (!store.open) return;
    const existing = lines.find((line) => line.dishId === item.id && !line.note);
    if (existing) {
      saveCart(
        lines.map((line) => (line.lineId === existing.lineId ? { ...line, qty: line.qty + amount } : line)),
        mode,
      );
      return;
    }
    saveCart(
      [
        ...lines,
        {
          lineId: crypto.randomUUID(),
          dishId: item.id,
          name: item.name,
          price: item.price,
          qty: amount,
          note: "",
        },
      ],
      mode,
    );
  }

  function addFromSheet() {
    if (!dish || !store.open) return;
    const clean = note.trim();
    if (!clean) {
      addPlain(dish, qty);
    } else {
      saveCart(
        [
          ...lines,
          {
            lineId: crypto.randomUUID(),
            dishId: dish.id,
            name: dish.name,
            price: dish.price,
            qty,
            note: clean,
          },
        ],
        mode,
      );
    }
    setDishId(null);
    setNote("");
    setQty(1);
  }

  function sendOrder() {
    const error = validateCustomer(store, lines, mode, customer);
    setFormError(error);
    if (error) return;
    const url = whatsappUrl(store.whatsapp, buildOrderMessage(store, lines, mode, customer));
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
    setSent(true);
  }

  const minimumGap =
    mode === "delivery" && totals.subtotal < store.deliveryMin ? store.deliveryMin - totals.subtotal : 0;

  return (
    <div className="mx-auto min-h-svh w-full max-w-lg overflow-x-clip bg-background shadow-[0_0_0_1px_rgba(42,33,24,0.04)]">
      <div className="relative h-52">
        <Image
          src={store.cover}
          alt="Mesa con tartas, pollo, canelones, pastel de papa y flan"
          fill
          priority
          sizes="(max-width: 512px) 100vw, 512px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a2118]/75 via-[#2a2118]/15 to-transparent" />
        <p className="absolute inset-x-5 bottom-4 text-sm text-white/90">{store.tagline}</p>
      </div>

      <header className="sticky top-0 z-20 max-w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-start gap-3 px-4 pt-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <House className="size-4" aria-hidden />
          </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-[1.7rem] leading-none tracking-tight">{store.name}</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {store.open ? "Recibiendo pedidos" : "Cocina cerrada"}
              </p>
              {store.hours && <p className="text-xs text-pretty text-muted-foreground">{store.hours}</p>}
            </div>
        </div>

        {(store.pickupEnabled || store.deliveryEnabled) && (
          <div className="px-4 pt-3">
            <ModeSwitch store={store} mode={mode} onChange={(next) => saveCart(lines, next)} />
            {store.deliveryEnabled && (store.deliveryFee > 0 || store.deliveryMin > 0) && (
              <p className="px-1 pt-2 text-xs text-muted-foreground">
                {store.deliveryFee > 0 ? `Delivery ${formatArs(store.deliveryFee)}` : "Delivery sin cargo"}
                {store.deliveryMin > 0 ? ` · mínimo ${formatArs(store.deliveryMin)}` : ""}
              </p>
            )}
          </div>
        )}

        <label className="mt-3 flex items-center gap-2 px-4">
          <span className="sr-only">Buscar en la carta</span>
          <span className="relative block w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar en la carta"
              className="h-11 w-full rounded-full border border-border bg-card pr-4 pl-9 text-base outline-none focus:ring-2 focus:ring-primary/30"
            />
          </span>
        </label>

        <div className="mt-3 flex w-full min-w-0 gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
          {groups.map((group) => (
            <button
              key={group.category.id}
              id={`chip-${group.category.id}`}
              type="button"
              aria-current={active === group.category.id ? "true" : undefined}
              onClick={() => jump(group.category.id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium",
                active === group.category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground ring-1 ring-border",
              )}
            >
              {group.category.name}
            </button>
          ))}
        </div>
      </header>

      {!store.open && (
        <p className="mx-4 mt-4 rounded-2xl bg-foreground px-4 py-3 text-sm text-background">
          Hoy no estamos tomando pedidos. La carta queda para mirar.
        </p>
      )}

      <main className="px-4">
        {groups.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">No hay platos con ese nombre.</p>
        )}
        {groups.map((group) => (
          <section key={group.category.id} id={`cat-${group.category.id}`} className="scroll-mt-44 pt-6">
            <h2 className="font-display text-[1.7rem] leading-none">{group.category.name}</h2>
            <ul className="mt-1 divide-y divide-border">
              {group.dishes.map((item) => (
                <li key={item.id} className="relative max-w-full py-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDishId(item.id);
                      setQty(1);
                      setNote("");
                      setPanel(null);
                    }}
                    className="flex w-full max-w-full items-center gap-3 pr-14 text-left"
                  >
                    {item.image ? (
                      <span className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-2xl bg-muted">
                        <Image src={item.image} alt="" fill sizes="72px" className="object-cover" />
                      </span>
                    ) : (
                      <DrinkMark name={item.name} />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{item.name}</span>
                      <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-muted-foreground">
                        {item.description}
                      </span>
                      <span className="mt-1 block text-sm font-semibold tabular-nums">{formatArs(item.price)}</span>
                    </span>
                  </button>
                  {plainQty(item.id) > 0 ? (
                    <div className="absolute top-1/2 right-0 -translate-y-1/2">
                      <Stepper
                        qty={plainQty(item.id)}
                        label={item.name}
                        onChange={(next) => {
                          const line = lines.find((itemLine) => itemLine.dishId === item.id && !itemLine.note);
                          if (!line) return;
                          setLineQty(line.lineId, next);
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!store.open}
                      aria-label={`Agregar ${item.name}`}
                      onClick={() => addPlain(item)}
                      className="absolute top-1/2 right-0 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
                    >
                      <Plus className="size-5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer
        className={cn(
          "space-y-2 px-5 text-sm text-muted-foreground",
          totals.count > 0 ? "pb-28" : "pb-10",
        )}
      >
        {store.address && <p>{store.address}</p>}
        {store.about && <p>{store.about}</p>}
        <p>{store.paymentNote}</p>
        <Link href="/admin" className="inline-block pt-4 text-xs tracking-wide text-muted-foreground/80">
          Cocina
        </Link>
      </footer>

      {totals.count > 0 && panel === null && !dish && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-lg px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setPanel("cart");
            }}
            className="flex w-full items-center justify-between rounded-full bg-primary px-5 py-3.5 text-primary-foreground shadow-lg"
          >
            <span className="text-sm font-semibold">
              Ver pedido · {totals.count} {totals.count === 1 ? "ítem" : "ítems"}
            </span>
            <span className="font-semibold tabular-nums">{formatArs(totals.total)}</span>
          </button>
        </div>
      )}

      <Sheet open={Boolean(dish)} title={dish?.name ?? "Plato"} onClose={() => setDishId(null)}>
        {dish && (
          <div>
            {dish.image && (
              <div className="relative -mx-5 -mt-2 mb-4 h-56">
                <Image src={dish.image} alt="" fill sizes="512px" className="object-cover" />
              </div>
            )}
            <p className="text-muted-foreground">{dish.description}</p>
            <p className="mt-2 font-semibold tabular-nums">{formatArs(dish.price)}</p>
            <label className="mt-4 block text-sm font-medium">
              Nota para la cocina
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Sin cebolla, bien cocido…"
                rows={2}
                className="mt-1.5 w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <div className="mt-4 flex items-center justify-between gap-3">
              <Stepper qty={qty} label={dish.name} onChange={(next) => setQty(Math.max(1, next))} />
              <button
                type="button"
                disabled={!store.open}
                onClick={addFromSheet}
                className="h-12 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
              >
                Agregar · {formatArs(dish.price * qty)}
              </button>
            </div>
          </div>
        )}
      </Sheet>

      <Sheet open={panel === "cart"} title="Tu pedido" onClose={() => setPanel(null)}>
        <ul className="divide-y divide-border">
          {lines.map((line) => (
            <li key={line.lineId} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{line.name}</p>
                {line.note && <p className="text-sm text-muted-foreground">{line.note}</p>}
                <p className="text-sm tabular-nums">{formatArs(line.price * line.qty)}</p>
              </div>
              <Stepper qty={line.qty} label={line.name} onChange={(next) => setLineQty(line.lineId, next)} />
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <ModeSwitch store={store} mode={mode} onChange={(next) => saveCart(lines, next)} />
        </div>
        <Totals store={store} lines={lines} mode={mode} />
        {minimumGap > 0 && (
          <p className="mt-3 text-sm text-primary">
            Para delivery faltan {formatArs(minimumGap)}. También podés retirar en el local.
          </p>
        )}
        <button
          type="button"
          disabled={!store.open || minimumGap > 0}
          onClick={() => {
            setFormError(null);
            setSent(false);
            setPanel("checkout");
          }}
          className="mt-4 h-12 w-full rounded-full bg-foreground text-sm font-semibold text-background disabled:bg-muted disabled:text-muted-foreground"
        >
          Continuar
        </button>
      </Sheet>

      <Sheet
        open={panel === "checkout"}
        title="Confirmar"
        onClose={() => {
          setPanel("cart");
          setSent(false);
        }}
      >
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            sendOrder();
          }}
        >
          <label className="block text-sm font-medium">
            Nombre
            <input
              required
              autoComplete="name"
              value={customer.name}
              onChange={(event) => saveCustomer({ ...customer, name: event.target.value })}
              className={`${fieldClass} mt-1.5`}
            />
          </label>
          <label className="block text-sm font-medium">
            Teléfono
            <input
              required
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="11 1234 5678"
              value={customer.phone}
              onChange={(event) => saveCustomer({ ...customer, phone: event.target.value })}
              className={`${fieldClass} mt-1.5`}
            />
          </label>
          {mode === "delivery" && (
            <label className="block text-sm font-medium">
              Dirección
              <input
                required
                autoComplete="street-address"
                placeholder="Calle, número, piso"
                value={customer.address}
                onChange={(event) => saveCustomer({ ...customer, address: event.target.value })}
                className={`${fieldClass} mt-1.5`}
              />
            </label>
          )}
          <WhenField
            value={customer.when}
            onChange={(when) => saveCustomer({ ...customer, when })}
          />
          <fieldset>
            <legend className="text-sm font-medium">Pago</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(
                [
                  ["efectivo", "Efectivo"],
                  ["transferencia", "Transferencia"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={cn(
                    "flex h-12 items-center justify-center rounded-2xl border text-sm font-medium",
                    customer.payment === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card",
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="sr-only"
                    checked={customer.payment === value}
                    onChange={() => saveCustomer({ ...customer, payment: value })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm font-medium">
            Nota
            <textarea
              rows={2}
              value={customer.note}
              onChange={(event) => saveCustomer({ ...customer, note: event.target.value })}
              placeholder="Timbre, referencia, alergias…"
              className="mt-1.5 w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <Totals store={store} lines={lines} mode={mode} />
          {formError && <p className="text-sm text-primary">{formError}</p>}
          {sent && (
            <p className="text-sm text-accent">
              Abrimos WhatsApp con el pedido. El mensaje se manda cuando vos lo confirmás ahí.
            </p>
          )}
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1f7a45] text-sm font-semibold text-white"
          >
            <MessageCircle className="size-4" aria-hidden />
            {sent ? "Abrir WhatsApp de nuevo" : "Enviar por WhatsApp"}
          </button>
          <p className="text-center text-xs text-muted-foreground">{store.paymentNote}</p>
        </form>
      </Sheet>
    </div>
  );
}

function localISODate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function subscribeNothing() {
  return () => {};
}

function splitWhen(value: string) {
  const named = value.match(/^(Hoy|Mañana)(?:\s+(\d{2}:\d{2}))?$/);
  if (named) return { day: named[1], date: "", time: named[2] ?? "" };
  const specific = value.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?$/);
  if (specific) return { day: "", date: specific[1], time: specific[2] ?? "" };
  if (/^\d{2}:\d{2}$/.test(value)) return { day: "", date: "", time: value };
  return { day: "", date: "", time: "" };
}

function joinWhen(day: string, date: string, time: string) {
  return [date || day, time].filter(Boolean).join(" ");
}

function WhenField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { day, date, time } = splitWhen(value);
  const [otherDay, setOtherDay] = useState(date !== "");
  const minDate = useSyncExternalStore(subscribeNothing, localISODate, () => "");
  const showingDate = otherDay || date !== "";

  function update(nextDay: string, nextDate: string, nextTime: string) {
    onChange(joinWhen(nextDay, nextDate, nextTime));
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium">¿Para cuándo?</legend>
      <div className="mt-1.5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Día">
        {(["Hoy", "Mañana"] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={day === option && !showingDate}
            onClick={() => {
              setOtherDay(false);
              update(day === option ? "" : option, "", time);
            }}
            className={cn(
              "h-12 rounded-2xl border text-sm font-medium",
              day === option && !showingDate
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card",
            )}
          >
            {option}
          </button>
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={showingDate}
          onClick={() => {
            setOtherDay(true);
            update("", date, time);
          }}
          className={cn(
            "h-12 rounded-2xl border px-2 text-sm font-medium",
            showingDate ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
          )}
        >
          Otro día
        </button>
      </div>
      {showingDate && (
        <label className="mt-2 block text-sm font-medium">
          Fecha
          <input
            type="date"
            min={minDate || undefined}
            value={date}
            onChange={(event) => {
              const next = event.target.value;
              if (next && minDate && next < minDate) return;
              update("", next, time);
            }}
            className={`${fieldClass} mt-1.5`}
          />
          {date && <span className="mt-1 block font-normal text-muted-foreground">{formatWhen(date)}</span>}
        </label>
      )}
      <label className="mt-2 block text-sm font-medium">
        Hora
        <input
          type="time"
          step={900}
          value={time}
          onChange={(event) => update(showingDate ? "" : day, showingDate ? date : "", event.target.value.slice(0, 5))}
          className={`${fieldClass} mt-1.5`}
        />
      </label>
    </fieldset>
  );
}

function ModeSwitch({
  store,
  mode,
  onChange,
}: {
  store: Store;
  mode: Fulfillment;
  onChange: (mode: Fulfillment) => void;
}) {
  const options = [
    store.pickupEnabled ? { id: "pickup" as const, label: "Retiro" } : null,
    store.deliveryEnabled
      ? {
          id: "delivery" as const,
          label: "Delivery",
        }
      : null,
  ].filter((option) => option !== null);

  if (options.length < 2) return null;

  return (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1" role="radiogroup" aria-label="Cómo lo querés">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={mode === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "min-w-0 truncate rounded-full px-2 py-2 text-center text-sm font-medium",
            mode === option.id ? "bg-card shadow-sm" : "text-muted-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Totals({ store, lines, mode }: { store: Store; lines: CartLine[]; mode: Fulfillment }) {
  const totals = quote(store, lines, mode);
  return (
    <dl className="mt-4 space-y-1 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="tabular-nums">{formatArs(totals.subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Envío</dt>
        <dd className="tabular-nums">{totals.fee > 0 ? formatArs(totals.fee) : "Sin cargo"}</dd>
      </div>
      <div className="flex justify-between text-base font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatArs(totals.total)}</dd>
      </div>
    </dl>
  );
}

function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[#2a2118]/45" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-[1.6rem] bg-background px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl outline-none">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-foreground/15" />
          <div className="mb-3 flex items-center justify-between gap-3">
            <Dialog.Title className="font-display text-3xl leading-none">{title}</Dialog.Title>
            <Dialog.Close className="grid size-9 place-items-center rounded-full bg-muted" aria-label="Cerrar">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{title}</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
