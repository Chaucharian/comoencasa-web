"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { COVER_IMAGES, FOOD_IMAGES, formatArs } from "@/lib/menu";
import { getStoreScheduleStatus } from "@/lib/schedule";
import type {
  Category,
  Dish,
  FirebaseStatusInfo,
  Order,
  OrderStatus,
  Store,
} from "@/lib/types";
import {
  ClipboardList,
  UtensilsCrossed,
  Layers,
  Store as StoreIcon,
  Cloud,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Search,
  ExternalLink,
  Flame,
  Scale,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  MessageCircle,
  MapPin,
  Phone,
  RefreshCw,
  Ban,
  PackageCheck,
  Upload,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

const fieldClass =
  "h-11 w-full rounded-xl border border-[#DFD8C4] bg-white px-3.5 text-sm text-[#222421] outline-none placeholder:text-[#5E4B3C]/50 focus:border-[#8F9E4B] focus:ring-1 focus:ring-[#8F9E4B] transition-all";

function shouldUnoptimizeImage(src?: string | null): boolean {
  if (!src) return false;
  return src.startsWith("/api/media/") || src.startsWith("data:") || src.startsWith("http");
}

/**
 * Compress & resize an image in the browser to WebP (~50-90KB) for fast, free cloud storage
 */
async function compressImageForUpload(
  file: File,
  maxDimension = 900,
  quality = 0.82,
): Promise<File> {
  if (typeof window === "undefined") return file;

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, "") || "plato";
          const compressed = new File([blob], `${baseName}.webp`, {
            type: "image/webp",
          });
          resolve(compressed);
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return slug || "categoria";
}

function uniqueId(base: string, ids: string[]) {
  if (!ids.includes(base)) return base;
  let n = 2;
  while (ids.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`.slice(0, 40);
}

export function AdminApp({
  authed,
  store,
  initialOrders = [],
  isFirebase = false,
  initialFirebaseStatus,
}: {
  authed: boolean;
  store: Store | null;
  initialOrders?: Order[];
  isFirebase?: boolean;
  initialFirebaseStatus?: FirebaseStatusInfo;
}) {
  if (!authed || !store) return <Login />;
  return (
    <Editor
      initial={store}
      initialOrders={initialOrders}
      isFirebase={isFirebase}
      initialFirebaseStatus={initialFirebaseStatus}
    />
  );
}

function Login() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center bg-[#FFFDF2] px-6 text-[#222421]">
      <div className="rounded-3xl border border-[#DFD8C4] bg-white p-7 shadow-xl">
        <p className="font-script text-2xl text-[#8F9E4B]">abrí y serví</p>
        <h1 className="mt-1 font-heading text-3xl font-black uppercase tracking-tight text-[#222421]">
          Panel de Control
        </h1>
        <p className="mt-2 text-sm text-[#5E4B3C]/80">
          Ingresá tu clave de administración para gestionar pedidos, viandas y envíos.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setError(null);
            const password = String(new FormData(event.currentTarget).get("password") ?? "");
            const response = await fetch("/api/admin/login", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ password }),
            });
            setPending(false);
            if (!response.ok) {
              setError("Clave incorrecta.");
              return;
            }
            router.refresh();
          }}
        >
          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#5E4B3C]">
            Clave de Acceso
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              className={`${fieldClass} mt-1.5`}
            />
          </label>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-xl bg-[#8F9E4B] text-xs font-heading font-black uppercase tracking-wider text-[#FFFDF2] shadow-md hover:bg-[#7D8B3F] active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
          >
            {pending ? "Verificando…" : "Ingresar"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-heading font-bold uppercase tracking-wider text-[#8F9E4B] hover:underline"
        >
          <span>← Volver a la web</span>
        </Link>
      </div>
    </main>
  );
}

type AdminTab = "orders" | "dishes" | "categories" | "store" | "database";

function Editor({
  initial,
  initialOrders = [],
  isFirebase = false,
  initialFirebaseStatus,
}: {
  initial: Store;
  initialOrders?: Order[];
  isFirebase?: boolean;
  initialFirebaseStatus?: FirebaseStatusInfo;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [orderFilter, setOrderFilter] = useState<"todos" | OrderStatus>("todos");
  const [orderSearch, setOrderSearch] = useState("");
  const [editing, setEditing] = useState<Dish | null>(null);
  const [creating, setCreating] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [uploads, setUploads] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>("all");
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseStatusInfo | undefined>(
    initialFirebaseStatus,
  );

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const categories = draft.categories.slice().sort((a, b) => a.sort - b.sort);

  // Load uploaded images gallery on mount
  useEffect(() => {
    fetch("/api/admin/upload")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { images?: string[] } | null) => {
        if (data?.images?.length) {
          setUploads((prev) => Array.from(new Set([...prev, ...(data.images || [])])));
        }
      })
      .catch(() => {});
  }, []);

  // Poll orders periodically
  useEffect(() => {
    const timer = setInterval(() => {
      refreshOrders(false);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  async function refreshOrders(showSpinner = true) {
    if (showSpinner) setIsRefreshingOrders(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
      }
    } catch (err) {
      console.warn("Error refreshing orders:", err);
    } finally {
      if (showSpinner) setIsRefreshingOrders(false);
    }
  }

  async function handleUpdateOrderStatus(orderId: string, newStatus: OrderStatus) {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus, updated_at: new Date().toISOString() }
          : o
      )
    );

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (!res.ok) {
        refreshOrders(false);
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      refreshOrders(false);
    }
  }

  async function handleDeleteOrder(orderId: string) {
    if (!window.confirm("¿Seguro que deseás eliminar este pedido del historial?")) return;
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await fetch(`/api/admin/orders?id=${orderId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error deleting order:", err);
      refreshOrders(false);
    }
  }

  async function persistStore(nextStore: Store, customMessage?: string): Promise<boolean> {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/store", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(nextStore),
      });
      const data = (await response.json()) as Store & {
        error?: string;
        firebaseStatus?: FirebaseStatusInfo;
      };
      setPending(false);

      if (response.status === 401) {
        router.refresh();
        return false;
      }
      if (!response.ok) {
        setError(data.error ?? "No se pudo guardar en la base de datos.");
        return false;
      }

      const { firebaseStatus: nextFbStatus, ...cleanStore } = data;
      if (nextFbStatus) {
        setFirebaseStatus(nextFbStatus);
      }

      setDraft(cleanStore);
      setSaved(cleanStore);
      setStatus(
        customMessage ||
          (nextFbStatus?.state === "connected"
            ? "Cambios guardados y sincronizados en Firebase Firestore."
            : "Cambios guardados en la base de datos."),
      );
      router.refresh();
      return true;
    } catch (err) {
      setPending(false);
      setError(err instanceof Error ? err.message : "Error de red al guardar.");
      return false;
    }
  }

  function patch(partial: Partial<Store>) {
    setDraft((current) => ({ ...current, ...partial }));
    setStatus(null);
  }

  function updateCategory(id: string, partial: Partial<Category>) {
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === id ? { ...category, ...partial } : category,
      ),
    }));
    setStatus(null);
  }

  function moveCategory(id: string, direction: -1 | 1) {
    const ordered = draft.categories.slice().sort((a, b) => a.sort - b.sort);
    const index = ordered.findIndex((category) => category.id === id);
    const other = ordered[index + direction];
    if (!other) return;
    const nextStore: Store = {
      ...draft,
      categories: draft.categories.map((category) => {
        if (category.id === id) return { ...category, sort: other.sort };
        if (category.id === other.id) return { ...category, sort: ordered[index].sort };
        return category;
      }),
    };
    setDraft(nextStore);
    void persistStore(nextStore, "Orden de categorías actualizado.");
  }

  function removeCategory(category: Category) {
    const count = draft.dishes.filter((dish) => dish.categoryId === category.id).length;
    const message = count
      ? `¿Eliminar la categoría "${category.name}" y sus ${count} platos?`
      : `¿Eliminar la categoría "${category.name}"?`;
    if (!window.confirm(message)) return;
    const nextStore: Store = {
      ...draft,
      categories: draft.categories.filter((item) => item.id !== category.id),
      dishes: draft.dishes.filter((dish) => dish.categoryId !== category.id),
    };
    setDraft(nextStore);
    void persistStore(nextStore, `Categoría "${category.name}" eliminada.`);
  }

  function addCategory() {
    const name = categoryName.trim();
    if (!name) return;
    const nextStore: Store = {
      ...draft,
      categories: [
        ...draft.categories,
        {
          id: uniqueId(slugify(name), draft.categories.map((c) => c.id)),
          name,
          sort: draft.categories.length,
        },
      ],
    };
    setCategoryName("");
    setDraft(nextStore);
    void persistStore(nextStore, `Categoría "${name}" creada.`);
  }

  function updateDish(id: string, partial: Partial<Dish>) {
    const now = new Date().toISOString();
    const nextStore: Store = {
      ...draft,
      dishes: draft.dishes.map((dish) =>
        dish.id === id ? { ...dish, ...partial, updated_at: now } : dish,
      ),
    };
    setDraft(nextStore);
    void persistStore(nextStore, "Estado del plato actualizado en la base de datos.");
  }

  function moveDish(id: string, direction: -1 | 1) {
    const dish = draft.dishes.find((item) => item.id === id);
    if (!dish) return;
    const siblings = draft.dishes
      .filter((item) => item.categoryId === dish.categoryId)
      .sort((a, b) => a.sort - b.sort);
    const index = siblings.findIndex((item) => item.id === id);
    const other = siblings[index + direction];
    if (!other) return;
    const nextStore: Store = {
      ...draft,
      dishes: draft.dishes.map((item) => {
        if (item.id === id) return { ...item, sort: other.sort };
        if (item.id === other.id) return { ...item, sort: dish.sort };
        return item;
      }),
    };
    setDraft(nextStore);
    void persistStore(nextStore, "Orden del plato actualizado.");
  }

  function removeDish(dish: Dish) {
    if (!window.confirm(`¿Eliminar "${dish.name}" de la carta?`)) return;
    const nextStore: Store = {
      ...draft,
      dishes: draft.dishes.filter((item) => item.id !== dish.id),
    };
    setDraft(nextStore);
    void persistStore(nextStore, `Plato "${dish.name}" eliminado de la carta.`);
  }

  function openNewDish(categoryId?: string) {
    const targetCat = categoryId || categories[0]?.id || "viandas";
    const siblings = draft.dishes.filter((d) => d.categoryId === targetCat);
    const now = new Date().toISOString();
    setCreating(true);
    setEditing({
      id: crypto.randomUUID(),
      categoryId: targetCat,
      name: "",
      description: "",
      price: 11000,
      image: null,
      available: true,
      sort: siblings.length ? siblings[siblings.length - 1].sort + 1 : 0,
      weight: "450g",
      regenTime: "8-10 min",
      method: "Herví sin abrir 8 a 10 min · Abrí y serví",
      tag: "",
      highlight: "",
      featured: false,
      created_at: now,
      updated_at: now,
    });
  }

  async function commitDish() {
    if (!editing) return;
    const trimmedName = editing.name.trim();
    if (!trimmedName) return;

    const now = new Date().toISOString();
    const updatedDish: Dish = {
      ...editing,
      name: trimmedName,
      created_at: editing.created_at || now,
      updated_at: now,
    };

    const nextStore: Store = {
      ...draft,
      dishes: creating
        ? [...draft.dishes, updatedDish]
        : draft.dishes.map((dish) => (dish.id === editing.id ? updatedDish : dish)),
    };

    setDraft(nextStore);
    const ok = await persistStore(
      nextStore,
      creating
        ? `Plato "${trimmedName}" creado y guardado en la base de datos.`
        : `Plato "${trimmedName}" actualizado y guardado en la base de datos.`,
    );

    if (ok) {
      setEditing(null);
      setCreating(false);
    }
  }

  async function upload(file: File) {
    const optimizedFile = await compressImageForUpload(file, 900, 0.82);
    const body = new FormData();
    body.set("file", optimizedFile);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const data = (await response.json()) as {
      path?: string;
      provider?: string;
      error?: string;
    };
    if (!response.ok || !data.path) throw new Error(data.error ?? "No se pudo subir la foto.");
    setUploads((current) => Array.from(new Set([data.path as string, ...current])));
    return data.path;
  }

  async function publish() {
    await persistStore(draft);
  }

  // Filtered dishes for Tab 2
  const filteredDishes = useMemo(() => {
    return draft.dishes.filter((dish) => {
      const matchesCat = selectedCatFilter === "all" || dish.categoryId === selectedCatFilter;
      const matchesSearch =
        !searchFilter.trim() ||
        dish.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [draft.dishes, selectedCatFilter, searchFilter]);

  // Filtered orders for Tab 1
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = orderFilter === "todos" || order.status === orderFilter;
      const matchesSearch =
        !orderSearch.trim() ||
        order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customerPhone.includes(orderSearch) ||
        order.id.toLowerCase().includes(orderSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderFilter, orderSearch]);

  const newOrdersCount = orders.filter((o) => o.status === "nuevo").length;

  return (
    <div className="min-h-screen bg-[#FFFDF2] text-[#222421]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#DFD8C4] bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-script text-xl text-[#8F9E4B] leading-none">abrí y serví</span>
                <span className="rounded-md bg-[#222421] px-1.5 py-0.5 font-heading text-[10px] font-black uppercase tracking-wider text-[#FFFDF2]">
                  Admin
                </span>
              </div>
              <p className="font-heading text-xs font-bold uppercase tracking-wider text-[#5E4B3C]/70">
                Gestión de Pedidos & Menú
              </p>
            </div>

            {/* Cloud Status badge */}
            <div className="hidden sm:block">
              {firebaseStatus?.state === "connected" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-800 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Firestore Conectado
                </span>
              ) : isFirebase ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("database")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-800 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer transition-colors"
                >
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  DB Activa · Ver Estado Firebase
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-800 border border-amber-500/20">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Base de Datos Local Activa
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Open/Close Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={draft.open}
              onClick={() => {
                const nextStore = { ...draft, open: !draft.open };
                setDraft(nextStore);
                void persistStore(
                  nextStore,
                  nextStore.open ? "Local abierto para pedidos." : "Local cerrado temporalmente.",
                );
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer shadow-2xs",
                draft.open
                  ? "bg-[#8F9E4B] text-[#FFFDF2] hover:bg-[#7D8B3F]"
                  : "bg-red-500 text-white hover:bg-red-600",
              )}
            >
              <span className="size-2 rounded-full bg-white animate-pulse" />
              <span>{draft.open ? "Abierto" : "Cerrado"}</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 rounded-full border border-[#DFD8C4] bg-[#FFFDF2] px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider text-[#222421] hover:bg-white transition-all shadow-2xs"
            >
              <span>Ver Web</span>
              <ExternalLink size={12} />
            </Link>

            <button
              type="button"
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                router.refresh();
              }}
              className="text-xs font-heading font-bold uppercase tracking-wider text-[#5E4B3C]/80 hover:text-red-600 transition-colors px-2 py-1"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={cn("mx-auto max-w-6xl px-4 sm:px-8 pt-6", dirty ? "pb-28" : "pb-12")}>
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto border-b border-[#DFD8C4] pb-2 scrollbar-none">
          {/* TAB: PEDIDOS */}
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-heading font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
              activeTab === "orders"
                ? "bg-[#222421] text-[#FFFDF2] shadow-sm"
                : "bg-white text-[#5E4B3C] border border-[#DFD8C4] hover:border-[#8F9E4B]",
            )}
          >
            <ClipboardList size={14} className={activeTab === "orders" ? "text-[#8F9E4B]" : ""} />
            <span>Pedidos</span>
            {newOrdersCount > 0 ? (
              <span className="rounded-full bg-amber-500 px-2 py-0.2 text-[10px] font-black text-white animate-pulse">
                {newOrdersCount} nuevo{newOrdersCount > 1 ? "s" : ""}
              </span>
            ) : (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  activeTab === "orders" ? "bg-[#8F9E4B] text-white" : "bg-[#DFD8C4]/60 text-[#222421]",
                )}
              >
                {orders.length}
              </span>
            )}
          </button>

          {/* TAB: VIANDAS */}
          <button
            type="button"
            onClick={() => setActiveTab("dishes")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-heading font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
              activeTab === "dishes"
                ? "bg-[#222421] text-[#FFFDF2] shadow-sm"
                : "bg-white text-[#5E4B3C] border border-[#DFD8C4] hover:border-[#8F9E4B]",
            )}
          >
            <UtensilsCrossed size={14} className={activeTab === "dishes" ? "text-[#8F9E4B]" : ""} />
            <span>Viandas & Menú</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                activeTab === "dishes" ? "bg-[#8F9E4B] text-white" : "bg-[#DFD8C4]/60 text-[#222421]",
              )}
            >
              {draft.dishes.length}
            </span>
          </button>

          {/* TAB: CATEGORÍAS */}
          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-heading font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
              activeTab === "categories"
                ? "bg-[#222421] text-[#FFFDF2] shadow-sm"
                : "bg-white text-[#5E4B3C] border border-[#DFD8C4] hover:border-[#8F9E4B]",
            )}
          >
            <Layers size={14} className={activeTab === "categories" ? "text-[#8F9E4B]" : ""} />
            <span>Categorías</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                activeTab === "categories"
                  ? "bg-[#8F9E4B] text-white"
                  : "bg-[#DFD8C4]/60 text-[#222421]",
              )}
            >
              {categories.length}
            </span>
          </button>

          {/* TAB: LOCAL & DELIVERY */}
          <button
            type="button"
            onClick={() => setActiveTab("store")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-heading font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
              activeTab === "store"
                ? "bg-[#222421] text-[#FFFDF2] shadow-sm"
                : "bg-white text-[#5E4B3C] border border-[#DFD8C4] hover:border-[#8F9E4B]",
            )}
          >
            <StoreIcon size={14} className={activeTab === "store" ? "text-[#8F9E4B]" : ""} />
            <span>Local & Horarios</span>
          </button>

          {/* TAB: BASE DE DATOS */}
          <button
            type="button"
            onClick={() => setActiveTab("database")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-heading font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
              activeTab === "database"
                ? "bg-[#222421] text-[#FFFDF2] shadow-sm"
                : "bg-white text-[#5E4B3C] border border-[#DFD8C4] hover:border-[#8F9E4B]",
            )}
          >
            <Cloud size={14} className={activeTab === "database" ? "text-[#8F9E4B]" : ""} />
            <span>Base de Datos</span>
          </button>
        </div>

        {/* Status Messages */}
        {!dirty && status && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-medium text-emerald-800">
            <CheckCircle2 size={16} />
            <span>{status}</span>
          </div>
        )}
        {!dirty && error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs font-medium text-red-800">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* TAB: ORDERS TRACKING (SIMPLE Y FUNCIONAL) */}
        {activeTab === "orders" && (
          <div className="mt-6 space-y-5">
            {/* Action Bar: Filters, Search, and Refresh */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white border border-[#DFD8C4] p-3.5 shadow-2xs">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E4B3C]/60" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Buscar cliente, WhatsApp o #ID..."
                    className="h-10 w-full rounded-xl border border-[#DFD8C4] bg-[#FFFDF2] pl-9 pr-3 text-xs text-[#222421] outline-none focus:border-[#8F9E4B]"
                  />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#5E4B3C]/60 hover:text-[#222421]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Filter Chips */}
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value as any)}
                  className="h-10 rounded-xl border border-[#DFD8C4] bg-[#FFFDF2] px-3 text-xs font-heading font-bold uppercase tracking-wider text-[#222421] outline-none focus:border-[#8F9E4B]"
                >
                  <option value="todos">Todos los pedidos ({orders.length})</option>
                  <option value="nuevo">Nuevos ({orders.filter((o) => o.status === "nuevo").length})</option>
                  <option value="aceptado">Aceptados ({orders.filter((o) => o.status === "aceptado").length})</option>
                  <option value="en_camino">En Camino ({orders.filter((o) => o.status === "en_camino").length})</option>
                  <option value="completado">Completados ({orders.filter((o) => o.status === "completado").length})</option>
                  <option value="cancelado">Cancelados ({orders.filter((o) => o.status === "cancelado").length})</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => refreshOrders(true)}
                disabled={isRefreshingOrders}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#DFD8C4] bg-[#FFFDF2] px-3.5 py-2 text-xs font-heading font-bold uppercase tracking-wider text-[#222421] hover:bg-white active:scale-98 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              >
                <RefreshCw size={13} className={isRefreshingOrders ? "animate-spin text-[#8F9E4B]" : ""} />
                <span>Actualizar</span>
              </button>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#DFD8C4] bg-white p-12 text-center">
                <ClipboardList size={36} className="mx-auto text-[#DFD8C4]" />
                <p className="mt-3 font-heading font-bold uppercase text-[#5E4B3C]">
                  No hay pedidos registrados
                </p>
                <p className="mt-1 text-xs text-[#5E4B3C]/70">
                  {orderFilter !== "todos"
                    ? `No hay pedidos con estado "${orderFilter}".`
                    : "Los pedidos que los clientes confirmen por WhatsApp se registrarán acá automáticamente."}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredOrders.map((order) => {
                  const dateStr = new Date(order.created_at).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  });

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-[#DFD8C4] bg-white p-4 sm:p-5 shadow-2xs space-y-3.5 hover:border-[#8F9E4B]/50 transition-all"
                    >
                      {/* Top Order Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFD8C4]/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-sm font-black text-[#222421] tracking-wide">
                            #{order.id}
                          </span>
                          <span className="text-[11px] font-sans text-[#5E4B3C]/75">
                            {dateStr}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-heading font-black uppercase tracking-wider border",
                              order.fulfillment === "delivery"
                                ? "bg-amber-500/10 text-amber-800 border-amber-500/25"
                                : "bg-blue-500/10 text-blue-800 border-blue-500/25",
                            )}
                          >
                            {order.fulfillment === "delivery" ? "🛵 Delivery" : "🏪 Retiro"}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-heading font-black uppercase tracking-wider border shadow-2xs",
                              order.status === "nuevo" && "bg-amber-500 text-white border-amber-600 animate-pulse",
                              order.status === "aceptado" && "bg-blue-600 text-white border-blue-700",
                              order.status === "en_camino" && "bg-purple-600 text-white border-purple-700",
                              order.status === "completado" && "bg-emerald-600 text-white border-emerald-700",
                              order.status === "cancelado" && "bg-gray-200 text-gray-700 border-gray-300",
                            )}
                          >
                            {order.status === "nuevo" && "🟡 Nuevo"}
                            {order.status === "aceptado" && "🔵 Aceptado"}
                            {order.status === "en_camino" && "🟣 En Camino"}
                            {order.status === "completado" && "🟢 Completado"}
                            {order.status === "cancelado" && "⚪ Cancelado"}
                          </span>
                        </div>
                      </div>

                      {/* Customer & Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-heading font-black text-[#222421]">
                              {order.customerName}
                            </strong>
                            <a
                              href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-heading font-black uppercase tracking-wider text-emerald-800 hover:bg-emerald-500/20"
                            >
                              <MessageCircle size={11} className="text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                          <p className="text-[#5E4B3C]/80 font-mono">
                            Tel: {order.customerPhone}
                          </p>
                          {order.customerAddress && (
                            <p className="flex items-center gap-1 text-[#5E4B3C]">
                              <MapPin size={12} className="text-[#8F9E4B] shrink-0" />
                              <span>{order.customerAddress}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-1 sm:text-right">
                          <p className="font-heading text-xs font-bold uppercase text-[#5E4B3C]">
                            Pago: {order.payment === "efectivo" ? "💵 Efectivo" : "💳 Transferencia"}
                          </p>
                          {order.note && (
                            <p className="text-[11px] italic text-[#5E4B3C]/80">
                              Nota: &quot;{order.note}&quot;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Items details */}
                      <div className="rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] p-3 space-y-1 text-xs">
                        <span className="text-[10px] font-heading font-bold uppercase text-[#5E4B3C]/70 block mb-1">
                          Platos del pedido:
                        </span>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[#222421]">
                            <span>
                              <strong>{item.qty}x</strong> {item.name}
                            </span>
                            <span className="font-mono text-[#5E4B3C]">
                              ${(item.price * item.qty).toLocaleString("es-AR")}
                            </span>
                          </div>
                        ))}

                        <div className="border-t border-[#DFD8C4]/60 pt-2 mt-2 flex justify-between items-center font-heading font-black text-sm text-[#222421]">
                          <span>Total</span>
                          <span className="text-[#668032]">${order.total.toLocaleString("es-AR")}</span>
                        </div>
                      </div>

                      {/* Status Action Buttons (Quick progression) */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#DFD8C4]/60">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {order.status === "nuevo" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, "aceptado")}
                                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-heading font-black uppercase tracking-wider text-white hover:bg-blue-700 shadow-2xs transition-all cursor-pointer"
                              >
                                <Check size={13} />
                                <span>Aceptar Pedido</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, "cancelado")}
                                className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 transition-all cursor-pointer"
                              >
                                Rechazar
                              </button>
                            </>
                          )}

                          {order.status === "aceptado" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, "en_camino")}
                                className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-heading font-black uppercase tracking-wider text-white hover:bg-purple-700 shadow-2xs transition-all cursor-pointer"
                              >
                                <Truck size={13} />
                                <span>Despachar (En Camino)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, "completado")}
                                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-heading font-black uppercase tracking-wider text-white hover:bg-emerald-700 transition-all cursor-pointer"
                              >
                                <Check size={13} />
                                <span>Completar</span>
                              </button>
                            </>
                          )}

                          {order.status === "en_camino" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.id, "completado")}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-heading font-black uppercase tracking-wider text-white hover:bg-emerald-700 shadow-2xs transition-all cursor-pointer"
                            >
                              <PackageCheck size={14} />
                              <span>Marcar como Entregado</span>
                            </button>
                          )}

                          {order.status === "completado" && (
                            <span className="inline-flex items-center gap-1 text-xs font-heading font-bold uppercase tracking-wider text-emerald-800">
                              <CheckCircle2 size={15} className="text-emerald-600" />
                              <span>Pedido Entregado con éxito</span>
                            </span>
                          )}

                          {order.status === "cancelado" && (
                            <span className="inline-flex items-center gap-1 text-xs font-heading font-bold uppercase tracking-wider text-gray-500">
                              <Ban size={14} />
                              <span>Pedido Cancelado</span>
                            </span>
                          )}
                        </div>

                        {/* Status selector override & delete button */}
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="h-8 rounded-lg border border-[#DFD8C4] bg-white px-2 text-[11px] font-heading font-bold uppercase tracking-wider text-[#222421] outline-none"
                          >
                            <option value="nuevo">Nuevo</option>
                            <option value="aceptado">Aceptado</option>
                            <option value="en_camino">En Camino</option>
                            <option value="completado">Completado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            title="Eliminar registro"
                            className="size-8 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: DISHES & VIANDAS */}
        {activeTab === "dishes" && (
          <div className="mt-6 space-y-5">
            {/* Action Bar: Search, Category Filter, and Add Dish button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white border border-[#DFD8C4] p-3.5 shadow-2xs">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E4B3C]/60" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Buscar por nombre o ingrediente..."
                    className="h-10 w-full rounded-xl border border-[#DFD8C4] bg-[#FFFDF2] pl-9 pr-3 text-xs text-[#222421] outline-none focus:border-[#8F9E4B]"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#5E4B3C]/60 hover:text-[#222421]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <select
                  value={selectedCatFilter}
                  onChange={(e) => setSelectedCatFilter(e.target.value)}
                  className="h-10 rounded-xl border border-[#DFD8C4] bg-[#FFFDF2] px-3 text-xs font-heading font-bold uppercase tracking-wider text-[#222421] outline-none focus:border-[#8F9E4B]"
                >
                  <option value="all">Todas las categorías ({draft.dishes.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({draft.dishes.filter((d) => d.categoryId === c.id).length})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => openNewDish()}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#8F9E4B] px-5 py-2.5 text-xs font-heading font-black uppercase tracking-wider text-white shadow-md hover:bg-[#7D8B3F] active:scale-98 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus size={15} />
                <span>Nuevo Plato</span>
              </button>
            </div>

            {/* Dishes Grid */}
            {filteredDishes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#DFD8C4] bg-white p-12 text-center">
                <UtensilsCrossed size={36} className="mx-auto text-[#DFD8C4]" />
                <p className="mt-3 font-heading font-bold uppercase text-[#5E4B3C]">
                  No se encontraron platos
                </p>
                <p className="mt-1 text-xs text-[#5E4B3C]/70">
                  Probá ajustando la búsqueda o agregá un nuevo plato al menú.
                </p>
                <button
                  type="button"
                  onClick={() => openNewDish()}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#8F9E4B] px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider text-white hover:bg-[#7D8B3F]"
                >
                  <Plus size={14} />
                  <span>Crear plato</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredDishes.map((dish) => {
                  const cat = categories.find((c) => c.id === dish.categoryId);
                  const isAvail = dish.available;

                  return (
                    <div
                      key={dish.id}
                      className={cn(
                        "group relative flex items-start gap-3.5 rounded-2xl border bg-white p-3.5 shadow-2xs transition-all hover:border-[#8F9E4B]/60",
                        isAvail ? "border-[#DFD8C4]" : "border-[#DFD8C4] opacity-65 bg-gray-50/50",
                      )}
                    >
                      {/* Dish Thumbnail */}
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-[#FFFDF2] border border-[#DFD8C4]">
                        {dish.image ? (
                          <Image
                            src={dish.image}
                            alt={dish.name}
                            fill
                            sizes="80px"
                            unoptimized={shouldUnoptimizeImage(dish.image)}
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#5E4B3C]/40">
                            <UtensilsCrossed size={24} />
                          </div>
                        )}
                        {dish.tag && (
                          <span className="absolute bottom-1 left-1 right-1 rounded bg-[#222421]/80 px-1 py-0.5 text-center font-heading text-[8px] font-black uppercase text-white truncate">
                            {dish.tag}
                          </span>
                        )}
                      </div>

                      {/* Dish Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-md bg-[#FFFDF2] border border-[#DFD8C4] px-1.5 py-0.5 text-[9px] font-heading font-bold uppercase tracking-wider text-[#5E4B3C]">
                            {cat?.name || "Sin categoría"}
                          </span>
                          <span className="font-heading font-black text-sm text-[#222421]">
                            {formatArs(dish.price)}
                          </span>
                        </div>

                        <h3 className="mt-1 font-heading font-bold text-sm text-[#222421] truncate">
                          {dish.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#5E4B3C]/70 line-clamp-1">
                          {dish.description}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[#DFD8C4]/60 pt-2 text-[11px]">
                          {/* Availability Toggle */}
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isAvail}
                            onClick={() => updateDish(dish.id, { available: !isAvail })}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer",
                              isAvail
                                ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/30"
                                : "bg-red-500/10 text-red-700 border border-red-500/30",
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                isAvail ? "bg-emerald-500" : "bg-red-500",
                              )}
                            />
                            <span>{isAvail ? "En carta" : "Agotado"}</span>
                          </button>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveDish(dish.id, -1)}
                              title="Subir orden"
                              className="size-7 rounded-lg border border-[#DFD8C4] bg-white text-[#5E4B3C] hover:bg-[#FFFDF2] hover:text-[#222421] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveDish(dish.id, 1)}
                              title="Bajar orden"
                              className="size-7 rounded-lg border border-[#DFD8C4] bg-white text-[#5E4B3C] hover:bg-[#FFFDF2] hover:text-[#222421] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <ArrowDown size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCreating(false);
                                setEditing(dish);
                              }}
                              title="Editar plato"
                              className="size-7 rounded-lg border border-[#8F9E4B]/40 bg-[#8F9E4B]/10 text-[#668032] hover:bg-[#8F9E4B] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDish(dish)}
                              title="Eliminar plato"
                              className="size-7 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="mt-6 space-y-6 max-w-2xl">
            {/* Add Category Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addCategory();
              }}
              className="flex items-center gap-2 rounded-2xl border border-[#DFD8C4] bg-white p-3.5 shadow-2xs"
            >
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nombre de la nueva categoría (ej: Guarniciones, Postres)"
                className="h-10 flex-1 rounded-xl border border-[#DFD8C4] bg-[#FFFDF2] px-3.5 text-xs text-[#222421] outline-none focus:border-[#8F9E4B]"
              />
              <button
                type="submit"
                disabled={!categoryName.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-[#8F9E4B] px-4 py-2.5 text-xs font-heading font-black uppercase tracking-wider text-white hover:bg-[#7D8B3F] disabled:opacity-50 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Agregar</span>
              </button>
            </form>

            {/* Categories List */}
            <div className="space-y-2.5">
              {categories.map((cat, index) => {
                const count = draft.dishes.filter((d) => d.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#DFD8C4] bg-white p-3.5 shadow-2xs hover:border-[#8F9E4B]/50 transition-all"
                  >
                    <div className="flex flex-1 items-center gap-2.5 min-w-0">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#FFFDF2] border border-[#DFD8C4] font-heading text-xs font-black text-[#5E4B3C]">
                        {index + 1}
                      </span>
                      <input
                        value={cat.name}
                        onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                        className="flex-1 min-w-0 rounded-lg px-2 py-1 font-heading text-sm font-bold text-[#222421] outline-none hover:bg-[#FFFDF2] focus:bg-[#FFFDF2] focus:ring-1 focus:ring-[#8F9E4B]"
                      />
                      <span className="rounded-full bg-[#FFFDF2] border border-[#DFD8C4] px-2.5 py-0.5 text-[10px] font-heading font-bold text-[#5E4B3C] whitespace-nowrap">
                        {count} {count === 1 ? "plato" : "platos"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveCategory(cat.id, -1)}
                        className="size-7 rounded-lg border border-[#DFD8C4] bg-white text-[#5E4B3C] hover:bg-[#FFFDF2] disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={index === categories.length - 1}
                        onClick={() => moveCategory(cat.id, 1)}
                        className="size-7 rounded-lg border border-[#DFD8C4] bg-white text-[#5E4B3C] hover:bg-[#FFFDF2] disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCategory(cat)}
                        className="size-7 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: LOCAL & DELIVERY */}
        {activeTab === "store" && (
          <div className="mt-6 max-w-3xl space-y-6">
            {/* General Info Card */}
            <div className="rounded-3xl border border-[#DFD8C4] bg-white p-6 shadow-2xs space-y-4">
              <h3 className="font-heading text-base font-black uppercase text-[#222421] border-b border-[#DFD8C4]/60 pb-2.5 flex items-center gap-2">
                <StoreIcon size={16} className="text-[#8F9E4B]" />
                <span>Datos del Negocio</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#5E4B3C]">
                  Nombre de la Marca
                  <input
                    value={draft.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    className={`${fieldClass} mt-1`}
                  />
                </label>

                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#5E4B3C]">
                  Frase / Descriptor
                  <input
                    value={draft.tagline}
                    onChange={(e) => patch({ tagline: e.target.value })}
                    className={`${fieldClass} mt-1`}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#5E4B3C]">
                  WhatsApp para Pedidos
                  <input
                    value={draft.whatsapp}
                    onChange={(e) => patch({ whatsapp: e.target.value })}
                    className={`${fieldClass} mt-1`}
                  />
                  <span className="mt-1 block text-[11px] font-normal text-[#5E4B3C]/70">
                    Solo números con código de país (ej: 5492235555555).
                  </span>
                </label>

                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#5E4B3C]">
                  Horarios de Atención y Entrega
                  <input
                    value={draft.hours}
                    onChange={(e) => patch({ hours: e.target.value })}
                    className={`${fieldClass} mt-1`}
                  />
                </label>
              </div>

              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#5E4B3C]">
                Zona de Cobertura o Dirección
                <input
                  value={draft.address}
                  onChange={(e) => patch({ address: e.target.value })}
                  className={`${fieldClass} mt-1`}
                />
              </label>

              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#5E4B3C]">
                Mensaje de Pago / Confirmación
                <textarea
                  value={draft.paymentNote}
                  rows={2}
                  onChange={(e) => patch({ paymentNote: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#DFD8C4] bg-white p-3 text-xs text-[#222421] outline-none focus:border-[#8F9E4B]"
                />
              </label>
            </div>

            {/* Delivery & Logistics Card */}
            <div className="rounded-3xl border border-[#DFD8C4] bg-white p-6 shadow-2xs space-y-4">
              <h3 className="font-heading text-base font-black uppercase text-[#222421] border-b border-[#DFD8C4]/60 pb-2.5 flex items-center gap-2">
                <Truck size={16} className="text-[#8F9E4B]" />
                <span>Configuración de Envíos y Horarios</span>
              </h3>

              {/* Real-time Schedule Status Display */}
              {(() => {
                const schedStatus = getStoreScheduleStatus(draft);
                return (
                  <div
                    className={cn(
                      "rounded-2xl border p-4 flex items-start gap-3 transition-colors",
                      schedStatus.canDeliver
                        ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                        : "bg-amber-50 border-amber-200 text-amber-950",
                    )}
                  >
                    <Clock
                      size={18}
                      className={
                        schedStatus.canDeliver
                          ? "text-emerald-600 mt-0.5 shrink-0"
                          : "text-amber-600 mt-0.5 shrink-0"
                      }
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <strong className="font-heading font-black uppercase tracking-wider text-xs sm:text-sm">
                          {schedStatus.canDeliver
                            ? "🟢 Local ABIERTO para delivery"
                            : "🔴 Local CERRADO para delivery"}
                        </strong>
                        <span className="font-mono text-[11px] font-bold opacity-80">
                          Hora actual (Arg): {schedStatus.currentArgentinaTime} hs
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-90 leading-relaxed">
                        {schedStatus.canDeliver
                          ? "Los clientes pueden pedir delivery con normalidad."
                          : schedStatus.reason || "Fuera del horario de atención para envíos."}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Shift Hours Selectors */}
              <div className="rounded-2xl border border-[#DFD8C4] bg-[#FFFDF2] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-black uppercase tracking-wider text-[#222421]">
                    Turnos de Delivery (Bloqueo Automático)
                  </span>
                  <span className="text-[10px] text-[#5E4B3C]/80">
                    Se bloquea la compra fuera de estos horarios
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Turno 1 (Mediodía) */}
                  <div className="rounded-xl border border-[#DFD8C4] bg-white p-3 space-y-2">
                    <span className="text-[11px] font-heading font-bold uppercase text-[#5E4B3C] block">
                      Turno Mediodía / Almuerzo
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[10px] font-bold text-[#5E4B3C]">
                        Desde
                        <input
                          type="time"
                          value={draft.deliverySchedule?.shifts?.[0]?.from || "11:30"}
                          onChange={(e) => {
                            const shifts = [
                              ...(draft.deliverySchedule?.shifts || [
                                { from: "11:30", to: "15:00" },
                                { from: "19:30", to: "22:30" },
                              ]),
                            ];
                            shifts[0] = { from: e.target.value, to: shifts[0]?.to || "15:00" };
                            patch({
                              deliverySchedule: { enabled: true, shifts },
                              hours: `Martes a domingo · ${shifts[0].from} a ${shifts[0].to} y ${shifts[1]?.from || "19:30"} a ${shifts[1]?.to || "22:30"}`,
                            });
                          }}
                          className="mt-1 h-9 w-full rounded-lg border border-[#DFD8C4] bg-[#FFFDF2] px-2 text-xs font-bold text-[#222421]"
                        />
                      </label>
                      <label className="text-[10px] font-bold text-[#5E4B3C]">
                        Hasta
                        <input
                          type="time"
                          value={draft.deliverySchedule?.shifts?.[0]?.to || "15:00"}
                          onChange={(e) => {
                            const shifts = [
                              ...(draft.deliverySchedule?.shifts || [
                                { from: "11:30", to: "15:00" },
                                { from: "19:30", to: "22:30" },
                              ]),
                            ];
                            shifts[0] = { from: shifts[0]?.from || "11:30", to: e.target.value };
                            patch({
                              deliverySchedule: { enabled: true, shifts },
                              hours: `Martes a domingo · ${shifts[0].from} a ${shifts[0].to} y ${shifts[1]?.from || "19:30"} a ${shifts[1]?.to || "22:30"}`,
                            });
                          }}
                          className="mt-1 h-9 w-full rounded-lg border border-[#DFD8C4] bg-[#FFFDF2] px-2 text-xs font-bold text-[#222421]"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Turno 2 (Noche) */}
                  <div className="rounded-xl border border-[#DFD8C4] bg-white p-3 space-y-2">
                    <span className="text-[11px] font-heading font-bold uppercase text-[#5E4B3C] block">
                      Turno Noche / Cena
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[10px] font-bold text-[#5E4B3C]">
                        Desde
                        <input
                          type="time"
                          value={draft.deliverySchedule?.shifts?.[1]?.from || "19:30"}
                          onChange={(e) => {
                            const shifts = [
                              ...(draft.deliverySchedule?.shifts || [
                                { from: "11:30", to: "15:00" },
                                { from: "19:30", to: "22:30" },
                              ]),
                            ];
                            shifts[1] = { from: e.target.value, to: shifts[1]?.to || "22:30" };
                            patch({
                              deliverySchedule: { enabled: true, shifts },
                              hours: `Martes a domingo · ${shifts[0]?.from || "11:30"} a ${shifts[0]?.to || "15:00"} y ${shifts[1].from} a ${shifts[1].to}`,
                            });
                          }}
                          className="mt-1 h-9 w-full rounded-lg border border-[#DFD8C4] bg-[#FFFDF2] px-2 text-xs font-bold text-[#222421]"
                        />
                      </label>
                      <label className="text-[10px] font-bold text-[#5E4B3C]">
                        Hasta
                        <input
                          type="time"
                          value={draft.deliverySchedule?.shifts?.[1]?.to || "22:30"}
                          onChange={(e) => {
                            const shifts = [
                              ...(draft.deliverySchedule?.shifts || [
                                { from: "11:30", to: "15:00" },
                                { from: "19:30", to: "22:30" },
                              ]),
                            ];
                            shifts[1] = { from: shifts[1]?.from || "19:30", to: e.target.value };
                            patch({
                              deliverySchedule: { enabled: true, shifts },
                              hours: `Martes a domingo · ${shifts[0]?.from || "11:30"} a ${shifts[0]?.to || "15:00"} y ${shifts[1].from} a ${shifts[1].to}`,
                            });
                          }}
                          className="mt-1 h-9 w-full rounded-lg border border-[#DFD8C4] bg-[#FFFDF2] px-2 text-xs font-bold text-[#222421]"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#5E4B3C]">
                  Costo de Envío ($)
                  <input
                    type="number"
                    min={0}
                    value={draft.deliveryFee}
                    onChange={(e) => patch({ deliveryFee: Math.max(0, Number(e.target.value) || 0) })}
                    className={`${fieldClass} mt-1`}
                  />
                </label>

                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#5E4B3C]">
                  Pedido Mínimo ($)
                  <input
                    type="number"
                    min={0}
                    value={draft.deliveryMin}
                    onChange={(e) => patch({ deliveryMin: Math.max(0, Number(e.target.value) || 0) })}
                    className={`${fieldClass} mt-1`}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2.5 rounded-xl border border-[#DFD8C4] p-3 text-xs font-heading font-bold text-[#222421] cursor-pointer hover:bg-[#FFFDF2]">
                  <input
                    type="checkbox"
                    checked={draft.deliveryEnabled}
                    onChange={(e) => patch({ deliveryEnabled: e.target.checked })}
                    className="size-4 rounded text-[#8F9E4B] focus:ring-[#8F9E4B]"
                  />
                  <span>Permitir Delivery a domicilio</span>
                </label>

                <label className="flex items-center gap-2.5 rounded-xl border border-[#DFD8C4] p-3 text-xs font-heading font-bold text-[#222421] cursor-pointer hover:bg-[#FFFDF2]">
                  <input
                    type="checkbox"
                    checked={draft.pickupEnabled}
                    onChange={(e) => patch({ pickupEnabled: e.target.checked })}
                    className="size-4 rounded text-[#8F9E4B] focus:ring-[#8F9E4B]"
                  />
                  <span>Permitir Retiro por el local</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB: DATABASE & CLOUD SYNC */}
        {activeTab === "database" && (
          <div className="mt-6 max-w-2xl space-y-5">
            <div className="rounded-3xl border border-[#DFD8C4] bg-white p-6 shadow-2xs space-y-4">
              <h3 className="font-heading text-base font-black uppercase text-[#222421] border-b border-[#DFD8C4]/60 pb-2.5 flex items-center gap-2">
                <Cloud size={16} className="text-[#8F9E4B]" />
                <span>Estado de la Base de Datos & Storage</span>
              </h3>

              {firebaseStatus && firebaseStatus.state !== "connected" && isFirebase && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 font-heading font-black uppercase text-amber-900">
                    <AlertCircle size={15} className="text-amber-600 shrink-0" />
                    <span>Acción recomendada en Firebase ({firebaseStatus.projectId})</span>
                  </div>
                  <p className="leading-relaxed text-[#5E4B3C]">
                    {firebaseStatus.message}
                  </p>
                  {firebaseStatus.consoleUrl && (
                    <a
                      href={firebaseStatus.consoleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-[11px] font-heading font-black uppercase tracking-wider text-white hover:bg-amber-700 transition-colors"
                    >
                      <span>Abrir Consola de Firebase Firestore</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}

              <div className="rounded-2xl bg-[#FFFDF2] border border-[#DFD8C4] p-4 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-[#5E4B3C]">Motor de Base de Datos:</span>
                  <span className="font-black text-[#222421]">
                    {firebaseStatus?.state === "connected"
                      ? `Google Cloud Firestore (${firebaseStatus.projectId})`
                      : isFirebase
                        ? `Híbrido (Base Local + Firebase ${firebaseStatus?.projectId || ""})`
                        : "Base de Datos Local JSON"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-[#5E4B3C]">Storage de Fotos:</span>
                  <span className="font-black text-[#668032]">
                    {isFirebase
                      ? "Firebase Storage + Firestore Media (WebP Optimizado Gratis)"
                      : "Almacenamiento Local (/menu & /api/media)"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-[#5E4B3C]">Colecciones:</span>
                  <span className="font-mono text-[#222421]">stores/abriyservi · orders · media</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-[#5E4B3C]">Total Platos:</span>
                  <span className="font-black text-[#8F9E4B]">{draft.dishes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-[#5E4B3C]">Total Pedidos Registrados:</span>
                  <span className="font-black text-[#8F9E4B]">{orders.length}</span>
                </div>
                {draft.updated_at && (
                  <div className="flex items-center justify-between border-t border-[#DFD8C4]/60 pt-2">
                    <span className="font-heading font-bold text-[#5E4B3C]">Última actualización:</span>
                    <span className="font-mono text-[11px] text-[#222421]">
                      {new Date(draft.updated_at).toLocaleString("es-AR")}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={publish}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8F9E4B] py-3 text-xs font-heading font-black uppercase tracking-wider text-white shadow-md hover:bg-[#7D8B3F] disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Cloud size={16} />
                  <span>{pending ? "Sincronizando…" : "Sincronizar y Forzar Guardado en Base de Datos"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Action Bar for Store Changes */}
      {dirty && (
        <div className="fixed inset-x-0 bottom-4 z-40 mx-auto w-full max-w-xl px-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between gap-3 rounded-full bg-[#222421] p-2 pl-5 text-[#FFFDF2] shadow-2xl border border-white/20">
            <div className="flex items-center gap-2 text-xs">
              <span className="size-2 rounded-full bg-[#8F9E4B] animate-ping" />
              <span className="font-heading font-bold uppercase tracking-wider text-amber-300">
                Cambios pendientes sin publicar
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft(saved);
                  setError(null);
                }}
                className="rounded-full px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider text-[#FFFDF2]/70 hover:text-white"
              >
                Descartar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={publish}
                className="flex items-center gap-1.5 rounded-full bg-[#8F9E4B] px-5 py-2 text-xs font-heading font-black uppercase tracking-wider text-white shadow-md hover:bg-[#7D8B3F] disabled:opacity-60 transition-all cursor-pointer"
              >
                <Check size={14} />
                <span>{pending ? "Guardando…" : "Publicar"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centered Dish Modal */}
      <DishModal
        dish={editing}
        categories={categories}
        uploads={uploads}
        isCreating={creating}
        isSaving={pending}
        onChange={setEditing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onCommit={commitDish}
        onUpload={upload}
        onUploadError={(msg) => setError(msg)}
      />
    </div>
  );
}

/**
 * Centered, clean, high-contrast modal dialog for editing and adding dishes
 */
function DishModal({
  dish,
  categories,
  uploads,
  isCreating,
  isSaving,
  onChange,
  onClose,
  onCommit,
  onUpload,
  onUploadError,
}: {
  dish: Dish | null;
  categories: Category[];
  uploads: string[];
  isCreating: boolean;
  isSaving: boolean;
  onChange: (dish: Dish) => void;
  onClose: () => void;
  onCommit: () => Promise<void> | void;
  onUpload: (file: File) => Promise<string>;
  onUploadError: (message: string) => void;
}) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const allImages = useMemo(() => {
    return [
      ...new Set([
        ...(dish?.image ? [dish.image] : []),
        ...uploads,
        ...FOOD_IMAGES,
      ]),
    ];
  }, [dish?.image, uploads]);

  if (!dish) return null;

  const currentNutri = dish.nutrition || {
    calories: 420,
    proteins: 35,
    carbs: 28,
    fats: 12,
    sodium: 480,
  };

  return (
    <Dialog.Root open={Boolean(dish)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Dimmed Blurred Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#222421]/75 backdrop-blur-sm animate-in fade-in duration-200" />

        {/* Centered Modal Container */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <Dialog.Content className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FFFDF2] border border-[#DFD8C4] shadow-2xl p-5 sm:p-7 text-[#222421] outline-none animate-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DFD8C4] pb-3 mb-4">
              <div>
                <Dialog.Title className="font-heading text-xl font-black uppercase tracking-tight text-[#222421]">
                  {isCreating ? "Crear Nuevo Plato" : "Editar Plato"}
                </Dialog.Title>
                <Dialog.Description className="text-xs text-[#5E4B3C]/75">
                  Al guardar, los cambios se actualizan directamente en la base de datos y en la web.
                </Dialog.Description>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-full bg-white border border-[#DFD8C4] text-[#5E4B3C] hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4">
              {/* 1. Main Info */}
              <div className="rounded-2xl border border-[#DFD8C4] bg-white p-4 space-y-3 shadow-2xs">
                <span className="text-[10px] font-heading font-black uppercase tracking-wider text-[#8F9E4B] block">
                  1. Información Principal
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-heading font-bold uppercase text-[#5E4B3C]">
                      Nombre del Plato *
                    </label>
                    <input
                      type="text"
                      value={dish.name}
                      onChange={(e) => onChange({ ...dish, name: e.target.value })}
                      placeholder="Ej: Bondiola braseada al vacío"
                      className={`${fieldClass} mt-1`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-heading font-bold uppercase text-[#5E4B3C]">
                      Precio ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={dish.price}
                      onChange={(e) =>
                        onChange({ ...dish, price: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className={`${fieldClass} mt-1`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-heading font-bold uppercase text-[#5E4B3C]">
                      Categoría
                    </label>
                    <select
                      value={dish.categoryId}
                      onChange={(e) => onChange({ ...dish, categoryId: e.target.value })}
                      className={`${fieldClass} mt-1`}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-heading font-bold uppercase text-[#5E4B3C]">
                      Tag Distintivo
                    </label>
                    <input
                      type="text"
                      value={dish.tag || ""}
                      onChange={(e) => onChange({ ...dish, tag: e.target.value })}
                      placeholder="Ej: 48G PROTEÍNA, PUNTO BABÉ"
                      className={`${fieldClass} mt-1`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold uppercase text-[#5E4B3C]">
                    Descripción / Ingredientes
                  </label>
                  <textarea
                    rows={2}
                    value={dish.description}
                    onChange={(e) => onChange({ ...dish, description: e.target.value })}
                    placeholder="Descripción apetitosa del plato y su guarnición..."
                    className="mt-1 w-full rounded-xl border border-[#DFD8C4] bg-white p-3 text-xs text-[#222421] outline-none focus:border-[#8F9E4B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold uppercase text-[#5E4B3C]">
                    Detalle Destacado del Vacío (Opcional)
                  </label>
                  <input
                    type="text"
                    value={dish.highlight || ""}
                    onChange={(e) => onChange({ ...dish, highlight: e.target.value })}
                    placeholder="Ej: Cocción al vacío que retiene el 100% de los jugos naturales..."
                    className={`${fieldClass} mt-1`}
                  />
                </div>
              </div>

              {/* 2. Vacuum & Regenerate Specs */}
              <div className="rounded-2xl border border-[#DFD8C4] bg-white p-4 space-y-3 shadow-2xs">
                <span className="text-[10px] font-heading font-black uppercase tracking-wider text-[#8F9E4B] block">
                  2. Envasado al Vacío & Regeneración
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-heading font-bold uppercase text-[#5E4B3C]">
                      Peso de la Porción
                    </label>
                    <input
                      type="text"
                      value={dish.weight || ""}
                      onChange={(e) => onChange({ ...dish, weight: e.target.value })}
                      placeholder="Ej: 450g"
                      className={`${fieldClass} mt-1`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-heading font-bold uppercase text-[#5E4B3C]">
                      Tiempo de Regeneración
                    </label>
                    <input
                      type="text"
                      value={dish.regenTime || ""}
                      onChange={(e) => onChange({ ...dish, regenTime: e.target.value })}
                      placeholder="Ej: 8-10 min"
                      className={`${fieldClass} mt-1`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold uppercase text-[#5E4B3C]">
                    Instrucción de Regeneración
                  </label>
                  <input
                    type="text"
                    value={dish.method || ""}
                    onChange={(e) => onChange({ ...dish, method: e.target.value })}
                    placeholder="Ej: Sumergí la bolsa 8 a 10 min en agua hirviendo · Abrí y serví"
                    className={`${fieldClass} mt-1`}
                  />
                </div>
              </div>

              {/* 3. Nutrition Information (Collapsible / Optional) */}
              <div className="rounded-2xl border border-[#DFD8C4] bg-white p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-heading font-black uppercase tracking-wider text-[#8F9E4B] flex items-center gap-1.5">
                    <Activity size={13} />
                    <span>3. Información Nutricional (Macros)</span>
                  </span>
                  <span className="text-[10px] text-[#5E4B3C]/70">Por porción</span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[10px] font-heading font-bold uppercase text-[#5E4B3C]">
                      Calorías
                    </label>
                    <input
                      type="number"
                      value={currentNutri.calories}
                      onChange={(e) =>
                        onChange({
                          ...dish,
                          nutrition: {
                            ...currentNutri,
                            calories: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="h-9 w-full rounded-lg border border-[#DFD8C4] bg-[#FFFDF2] px-2 text-center text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-heading font-bold uppercase text-[#668032]">
                      Proteínas (g)
                    </label>
                    <input
                      type="number"
                      value={currentNutri.proteins}
                      onChange={(e) =>
                        onChange({
                          ...dish,
                          nutrition: {
                            ...currentNutri,
                            proteins: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="h-9 w-full rounded-lg border border-[#8F9E4B]/40 bg-[#8F9E4B]/10 px-2 text-center text-xs font-black text-[#668032]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-heading font-bold uppercase text-[#5E4B3C]">
                      Carbos (g)
                    </label>
                    <input
                      type="number"
                      value={currentNutri.carbs}
                      onChange={(e) =>
                        onChange({
                          ...dish,
                          nutrition: {
                            ...currentNutri,
                            carbs: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="h-9 w-full rounded-lg border border-[#DFD8C4] bg-[#FFFDF2] px-2 text-center text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-heading font-bold uppercase text-[#5E4B3C]">
                      Grasas (g)
                    </label>
                    <input
                      type="number"
                      value={currentNutri.fats}
                      onChange={(e) =>
                        onChange({
                          ...dish,
                          nutrition: {
                            ...currentNutri,
                            fats: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="h-9 w-full rounded-lg border border-[#DFD8C4] bg-[#FFFDF2] px-2 text-center text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-heading font-bold uppercase text-[#5E4B3C]">
                      Sodio (mg)
                    </label>
                    <input
                      type="number"
                      value={currentNutri.sodium || 0}
                      onChange={(e) =>
                        onChange({
                          ...dish,
                          nutrition: {
                            ...currentNutri,
                            sodium: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="h-9 w-full rounded-lg border border-[#DFD8C4] bg-[#FFFDF2] px-2 text-center text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Dish Photo (Upload & Gallery) */}
              <div className="rounded-2xl border border-[#DFD8C4] bg-white p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-heading font-black uppercase tracking-wider text-[#8F9E4B] block">
                    4. Foto del Plato
                  </span>
                  <span className="text-[10px] text-[#5E4B3C]/70">
                    Compresión WebP automática · Cloud & Local
                  </span>
                </div>

                {/* Current Image Preview + Upload Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] p-3">
                  <div className="relative h-24 w-full sm:w-28 shrink-0 overflow-hidden rounded-xl border border-[#DFD8C4] bg-white">
                    {dish.image ? (
                      <Image
                        src={dish.image}
                        alt={dish.name || "Vista previa"}
                        fill
                        sizes="112px"
                        unoptimized={shouldUnoptimizeImage(dish.image)}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-[#5E4B3C]/40 gap-1">
                        <ImageIcon size={22} />
                        <span className="text-[9px] font-heading font-bold uppercase">Sin foto</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        className={cn(
                          "inline-flex items-center gap-2 rounded-xl bg-[#8F9E4B] px-4 py-2.5 text-xs font-heading font-black uppercase tracking-wider text-white shadow-sm hover:bg-[#7D8B3F] transition-all cursor-pointer",
                          uploadingPhoto && "opacity-60 pointer-events-none",
                        )}
                      >
                        {uploadingPhoto ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Subiendo foto…</span>
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            <span>Subir Foto desde tu dispositivo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                          className="sr-only"
                          disabled={uploadingPhoto}
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            if (!file) return;
                            setUploadingPhoto(true);
                            setUploadNotice(null);
                            try {
                              const uploadedPath = await onUpload(file);
                              onChange({ ...dish, image: uploadedPath });
                              setUploadNotice("¡Foto optimizada y cargada con éxito!");
                            } catch (err) {
                              onUploadError(
                                err instanceof Error ? err.message : "Error al subir la imagen.",
                              );
                            } finally {
                              setUploadingPhoto(false);
                            }
                          }}
                        />
                      </label>

                      {dish.image && (
                        <button
                          type="button"
                          onClick={() => onChange({ ...dish, image: null })}
                          className="rounded-xl border border-[#DFD8C4] bg-white px-3 py-2 text-[11px] font-heading font-bold uppercase text-[#5E4B3C] hover:text-red-600 transition-colors cursor-pointer"
                        >
                          Quitar foto
                        </button>
                      )}
                    </div>

                    {uploadNotice && (
                      <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <Check size={12} />
                        <span>{uploadNotice}</span>
                      </p>
                    )}

                    <input
                      type="text"
                      value={dish.image || ""}
                      onChange={(e) =>
                        onChange({ ...dish, image: e.target.value.trim() || null })
                      }
                      placeholder="O pegá una ruta / URL de imagen (ej: /menu/bondiola.jpg o https://...)"
                      className="h-8 w-full rounded-lg border border-[#DFD8C4] bg-white px-2.5 text-[11px] text-[#222421] outline-none focus:border-[#8F9E4B]"
                    />
                  </div>
                </div>

                {/* Quick Gallery Picker */}
                <div>
                  <span className="text-[10px] font-heading font-bold uppercase text-[#5E4B3C]/80 block mb-1.5">
                    Galería rápida (tus fotos subidas y catálogo):
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {allImages.map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => onChange({ ...dish, image: src })}
                        className={cn(
                          "relative size-16 shrink-0 overflow-hidden rounded-xl border cursor-pointer transition-all",
                          dish.image === src
                            ? "border-[#8F9E4B] ring-2 ring-[#8F9E4B]"
                            : "border-[#DFD8C4] hover:opacity-80",
                        )}
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes="64px"
                          unoptimized={shouldUnoptimizeImage(src)}
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Availability Switch */}
              <div className="flex items-center justify-between rounded-2xl border border-[#DFD8C4] bg-white p-3.5 shadow-2xs">
                <div>
                  <span className="font-heading text-xs font-bold uppercase text-[#222421] block">
                    Disponibilidad en Carta
                  </span>
                  <span className="text-[11px] text-[#5E4B3C]/70">
                    {dish.available
                      ? "Visible y disponible para comprar."
                      : "Marcado como agotado en la web."}
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={dish.available}
                  onClick={() => onChange({ ...dish, available: !dish.available })}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer",
                    dish.available
                      ? "bg-emerald-500 text-white"
                      : "bg-red-500 text-white",
                  )}
                >
                  <span className="size-2 rounded-full bg-white animate-pulse" />
                  <span>{dish.available ? "Disponible" : "Agotado"}</span>
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[#DFD8C4] pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-full px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider text-[#5E4B3C] hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!dish.name.trim() || isSaving || uploadingPhoto}
                onClick={onCommit}
                className="flex items-center gap-1.5 rounded-full bg-[#8F9E4B] px-6 py-2.5 text-xs font-heading font-black uppercase tracking-wider text-white shadow-md hover:bg-[#7D8B3F] disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Guardando en DB…</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>{isCreating ? "Crear y Guardar Plato" : "Guardar Cambios"}</span>
                  </>
                )}
              </button>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
