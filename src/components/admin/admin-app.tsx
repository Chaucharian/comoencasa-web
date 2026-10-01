"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { COVER_IMAGES, FOOD_IMAGES, formatArs } from "@/lib/menu";
import type { Category, Dish, Store } from "@/lib/types";

const fieldClass =
  "h-12 w-full rounded-2xl border border-border bg-card px-4 text-base outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/30";

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

export function AdminApp({ authed, store }: { authed: boolean; store: Store | null }) {
  if (!authed || !store) return <Login />;
  return <Editor initial={store} />;
}

function Login() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col justify-center bg-background px-5">
      <p className="text-sm font-medium text-primary">Como en Casa</p>
      <h1 className="mt-1 font-display text-5xl">Cocina</h1>
      <p className="mt-2 text-muted-foreground">Acá se edita la carta, el horario y el WhatsApp que recibe los pedidos.</p>
      <form
        className="mt-6 space-y-3"
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
        <label className="block text-sm font-medium">
          Clave
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`${fieldClass} mt-1.5`}
          />
        </label>
        {error && <p className="text-sm text-primary">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <Link href="/" className="mt-6 text-sm text-muted-foreground">
        Volver a la carta
      </Link>
    </main>
  );
}

function Editor({ initial }: { initial: Store }) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [creating, setCreating] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [uploads, setUploads] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const categories = draft.categories.slice().sort((a, b) => a.sort - b.sort);

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
    setDraft((current) => {
      const ordered = current.categories.slice().sort((a, b) => a.sort - b.sort);
      const index = ordered.findIndex((category) => category.id === id);
      const other = ordered[index + direction];
      if (!other) return current;
      return {
        ...current,
        categories: current.categories.map((category) => {
          if (category.id === id) return { ...category, sort: other.sort };
          if (category.id === other.id) return { ...category, sort: ordered[index].sort };
          return category;
        }),
      };
    });
    setStatus(null);
  }

  function removeCategory(category: Category) {
    const count = draft.dishes.filter((dish) => dish.categoryId === category.id).length;
    const message = count
      ? `Se borra “${category.name}” y sus ${count} platos.`
      : `Se borra “${category.name}”.`;
    if (!window.confirm(message)) return;
    setDraft((current) => ({
      ...current,
      categories: current.categories.filter((item) => item.id !== category.id),
      dishes: current.dishes.filter((dish) => dish.categoryId !== category.id),
    }));
    setStatus(null);
  }

  function addCategory() {
    const name = categoryName.trim();
    if (!name) return;
    setDraft((current) => ({
      ...current,
      categories: [
        ...current.categories,
        {
          id: uniqueId(slugify(name), current.categories.map((category) => category.id)),
          name,
          sort: current.categories.length,
        },
      ],
    }));
    setCategoryName("");
    setStatus(null);
  }

  function dishesIn(categoryId: string) {
    return draft.dishes.filter((dish) => dish.categoryId === categoryId).sort((a, b) => a.sort - b.sort);
  }

  function updateDish(id: string, partial: Partial<Dish>) {
    setDraft((current) => ({
      ...current,
      dishes: current.dishes.map((dish) => (dish.id === id ? { ...dish, ...partial } : dish)),
    }));
    setStatus(null);
  }

  function moveDish(id: string, direction: -1 | 1) {
    setDraft((current) => {
      const dish = current.dishes.find((item) => item.id === id);
      if (!dish) return current;
      const siblings = current.dishes
        .filter((item) => item.categoryId === dish.categoryId)
        .sort((a, b) => a.sort - b.sort);
      const index = siblings.findIndex((item) => item.id === id);
      const other = siblings[index + direction];
      if (!other) return current;
      return {
        ...current,
        dishes: current.dishes.map((item) => {
          if (item.id === id) return { ...item, sort: other.sort };
          if (item.id === other.id) return { ...item, sort: dish.sort };
          return item;
        }),
      };
    });
    setStatus(null);
  }

  function removeDish(dish: Dish) {
    if (!window.confirm(`Se borra “${dish.name}”.`)) return;
    setDraft((current) => ({
      ...current,
      dishes: current.dishes.filter((item) => item.id !== dish.id),
    }));
    setStatus(null);
  }

  function openNew(categoryId: string) {
    const siblings = dishesIn(categoryId);
    setCreating(true);
    setEditing({
      id: crypto.randomUUID(),
      categoryId,
      name: "",
      description: "",
      price: 0,
      image: null,
      available: true,
      sort: siblings.length ? siblings[siblings.length - 1].sort + 1 : 0,
    });
  }

  function commitDish() {
    if (!editing) return;
    if (!editing.name.trim()) return;
    setDraft((current) => ({
      ...current,
      dishes: creating
        ? [...current.dishes, { ...editing, name: editing.name.trim() }]
        : current.dishes.map((dish) =>
            dish.id === editing.id ? { ...editing, name: editing.name.trim() } : dish,
          ),
    }));
    setEditing(null);
    setCreating(false);
    setStatus(null);
  }

  async function upload(file: File) {
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const data = (await response.json()) as { path?: string; error?: string };
    if (!response.ok || !data.path) throw new Error(data.error ?? "No se pudo subir la foto.");
    setUploads((current) => [data.path as string, ...current]);
    return data.path;
  }

  async function publish() {
    setPending(true);
    setError(null);
    const response = await fetch("/api/admin/store", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = (await response.json()) as Store & { error?: string };
    setPending(false);
    if (response.status === 401) {
      router.refresh();
      return;
    }
    if (!response.ok) {
      setError(data.error ?? "No se pudo publicar.");
      return;
    }
    setDraft(data);
    setSaved(data);
    setStatus("Carta publicada.");
  }

  return (
    <div className={cn("mx-auto min-h-svh max-w-lg bg-background", dirty ? "pb-28" : "pb-10")}>
      <header className="flex items-start justify-between gap-3 px-5 pt-6">
        <div>
          <p className="text-sm font-medium text-primary">Como en Casa</p>
          <h1 className="font-display text-4xl leading-none">Cocina</h1>
        </div>
        <div className="flex gap-3 pt-2 text-sm">
          <Link href="/" className="text-muted-foreground">
            Ver carta
          </Link>
          <button
            type="button"
            className="text-muted-foreground"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              router.refresh();
            }}
          >
            Salir
          </button>
        </div>
      </header>

      <section className="px-5 pt-6">
        <div className="flex items-center justify-between rounded-3xl bg-card px-4 py-3 ring-1 ring-border">
          <div>
            <p className="font-medium">{draft.open ? "Recibiendo pedidos" : "Cocina cerrada"}</p>
            <p className="text-sm text-muted-foreground">Los clientes ven la carta igual.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.open}
            onClick={() => patch({ open: !draft.open })}
            className={cn(
              "rounded-full px-3 py-2 text-sm font-semibold",
              draft.open ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {draft.open ? "Abierta" : "Cerrada"}
          </button>
        </div>
      </section>

      <section className="px-5 pt-8">
        <h2 className="font-display text-3xl">La carta</h2>
        <div className="mt-4 space-y-8">
          {categories.map((category, index) => (
            <div key={category.id}>
              <div className="flex items-center gap-2">
                <input
                  aria-label={`Nombre de ${category.name}`}
                  value={category.name}
                  onChange={(event) => updateCategory(category.id, { name: event.target.value })}
                  className="min-w-0 flex-1 bg-transparent font-display text-2xl outline-none"
                />
                <TextButton disabled={index === 0} onClick={() => moveCategory(category.id, -1)}>
                  Subir
                </TextButton>
                <TextButton
                  disabled={index === categories.length - 1}
                  onClick={() => moveCategory(category.id, 1)}
                >
                  Bajar
                </TextButton>
                <TextButton onClick={() => removeCategory(category)}>Borrar</TextButton>
              </div>
              <ul className="mt-2 divide-y divide-border">
                {dishesIn(category.id).map((dish, dishIndex, siblings) => (
                  <li key={dish.id} className={cn("flex gap-3 py-3", !dish.available && "opacity-60")}>
                    <Thumb src={dish.image} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{dish.name}</p>
                      <p className="text-sm tabular-nums text-muted-foreground">{formatArs(dish.price)}</p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={dish.available}
                          onClick={() => updateDish(dish.id, { available: !dish.available })}
                          className={cn("font-medium", dish.available ? "text-accent" : "text-primary")}
                        >
                          {dish.available ? "En carta" : "Agotado"}
                        </button>
                        <button type="button" onClick={() => { setCreating(false); setEditing(dish); }}>
                          Editar
                        </button>
                        <button type="button" disabled={dishIndex === 0} onClick={() => moveDish(dish.id, -1)} className="disabled:opacity-30">
                          Subir
                        </button>
                        <button
                          type="button"
                          disabled={dishIndex === siblings.length - 1}
                          onClick={() => moveDish(dish.id, 1)}
                          className="disabled:opacity-30"
                        >
                          Bajar
                        </button>
                        <button type="button" onClick={() => removeDish(dish)}>
                          Borrar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => openNew(category.id)} className="mt-2 text-sm font-semibold text-primary">
                + Plato en {category.name}
              </button>
            </div>
          ))}
        </div>

        <form
          className="mt-8 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            addCategory();
          }}
        >
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Nueva categoría"
            className={fieldClass}
          />
          <button type="submit" className="h-12 shrink-0 rounded-full bg-foreground px-4 text-sm font-semibold text-background">
            Agregar
          </button>
        </form>
      </section>

      <section className="space-y-3 px-5 pt-10">
        <h2 className="font-display text-3xl">El local</h2>
        <Field label="Nombre" value={draft.name} onChange={(name) => patch({ name })} />
        <Field label="Frase" value={draft.tagline} onChange={(tagline) => patch({ tagline })} />
        <Field
          label="WhatsApp"
          value={draft.whatsapp}
          onChange={(whatsapp) => patch({ whatsapp })}
          hint={
            draft.whatsapp === "5491112345678"
              ? "Este número es de ejemplo. Cambialo por el del local, con código de país."
              : "Los pedidos llegan a este número. Solo dígitos, con código de país."
          }
          warn={draft.whatsapp === "5491112345678"}
        />
        <Field label="Dirección" value={draft.address} onChange={(address) => patch({ address })} />
        <Field label="Horario" value={draft.hours} onChange={(hours) => patch({ hours })} />
        <Field label="Texto de la carta" value={draft.about} onChange={(about) => patch({ about })} multiline />
        <Field
          label="Cómo se paga"
          value={draft.paymentNote}
          onChange={(paymentNote) => patch({ paymentNote })}
          multiline
        />
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Envío" value={draft.deliveryFee} onChange={(deliveryFee) => patch({ deliveryFee })} />
          <NumberField
            label="Mínimo delivery"
            value={draft.deliveryMin}
            onChange={(deliveryMin) => patch({ deliveryMin })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Toggle
            checked={draft.pickupEnabled}
            onChange={(pickupEnabled) => {
              if (!pickupEnabled && !draft.deliveryEnabled) return;
              patch({ pickupEnabled });
            }}
            label="Retiro"
          />
          <Toggle
            checked={draft.deliveryEnabled}
            onChange={(deliveryEnabled) => {
              if (!deliveryEnabled && !draft.pickupEnabled) return;
              patch({ deliveryEnabled });
            }}
            label="Delivery"
          />
        </div>
        <div>
          <p className="text-sm font-medium">Foto de portada</p>
          <ImageChoices
            images={[...new Set([...uploads, ...COVER_IMAGES])]}
            selected={draft.cover}
            allowEmpty={false}
            onSelect={(cover) => {
              if (cover) patch({ cover });
            }}
            onUpload={async (file) => {
              try {
                patch({ cover: await upload(file) });
              } catch (uploadError) {
                setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la foto.");
              }
            }}
          />
        </div>
      </section>

      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-lg px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2 rounded-full bg-foreground p-1.5 pl-4 text-background shadow-lg">
            <p className="min-w-0 flex-1 text-sm">{error ?? "Cambios sin publicar"}</p>
            <button type="button" onClick={() => { setDraft(saved); setError(null); }} className="px-2 text-sm">
              Descartar
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={publish}
              className="h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {pending ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </div>
      )}
      {!dirty && status && <p className="px-5 pt-6 text-sm text-accent">{status}</p>}
      {!dirty && error && <p className="px-5 pt-6 text-sm text-primary">{error}</p>}

      <DishDialog
        dish={editing}
        categories={categories}
        uploads={uploads}
        onChange={setEditing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onCommit={commitDish}
        onUpload={upload}
        onUploadError={(message) => setError(message)}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
  warn,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  warn?: boolean;
  multiline?: boolean;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {multiline ? (
        <textarea
          value={value}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1.5 w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary/30"
        />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} mt-1.5`} />
      )}
      {hint && (
        <span className={cn("mt-1 block font-normal", warn ? "text-primary" : "text-muted-foreground")}>
          {hint}
        </span>
      )}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(Number.isFinite(next) && next >= 0 ? Math.round(next) : 0);
        }}
        className={`${fieldClass} mt-1.5`}
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "h-12 rounded-2xl text-sm font-semibold",
        checked ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </button>
  );
}

function TextButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="text-sm text-muted-foreground disabled:opacity-30">
      {children}
    </button>
  );
}

function Thumb({ src }: { src: string | null }) {
  if (!src) {
    return <span className="size-14 shrink-0 rounded-2xl bg-muted" />;
  }
  return (
    <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-muted">
      <Image src={src} alt="" fill sizes="56px" className="object-cover" />
    </span>
  );
}

function ImageChoices({
  images,
  selected,
  allowEmpty = true,
  onSelect,
  onUpload,
}: {
  images: string[];
  selected: string | null;
  allowEmpty?: boolean;
  onSelect: (src: string | null) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {allowEmpty && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "grid size-16 shrink-0 place-items-center rounded-2xl bg-muted text-xs",
            selected === null && "ring-2 ring-primary",
          )}
        >
          Sin foto
        </button>
      )}
      {images.map((src) => (
        <button
          key={src}
          type="button"
          onClick={() => onSelect(src)}
          className={cn("relative size-16 shrink-0 overflow-hidden rounded-2xl", selected === src && "ring-2 ring-primary")}
        >
          <Image src={src} alt="" fill sizes="64px" className="object-cover" />
        </button>
      ))}
      <label className="grid size-16 shrink-0 cursor-pointer place-items-center rounded-2xl border border-dashed border-border text-xs">
        Subir
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onUpload(file);
          }}
        />
      </label>
    </div>
  );
}

function DishDialog({
  dish,
  categories,
  uploads,
  onChange,
  onClose,
  onCommit,
  onUpload,
  onUploadError,
}: {
  dish: Dish | null;
  categories: Category[];
  uploads: string[];
  onChange: (dish: Dish) => void;
  onClose: () => void;
  onCommit: () => void;
  onUpload: (file: File) => Promise<string>;
  onUploadError: (message: string) => void;
}) {
  const images = [...new Set([...(dish?.image ? [dish.image] : []), ...uploads, ...FOOD_IMAGES])];

  return (
    <Dialog.Root open={Boolean(dish)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[#2a2118]/45" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-[1.6rem] bg-background px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none">
          <Dialog.Title className="font-display text-3xl">Plato</Dialog.Title>
          <Dialog.Description className="sr-only">Editar plato</Dialog.Description>
          {dish && (
            <div className="mt-4 space-y-3">
              <Field label="Nombre" value={dish.name} onChange={(name) => onChange({ ...dish, name })} />
              <Field
                label="Descripción"
                value={dish.description}
                onChange={(description) => onChange({ ...dish, description })}
                multiline
              />
              <NumberField label="Precio" value={dish.price} onChange={(price) => onChange({ ...dish, price })} />
              <label className="block text-sm font-medium">
                Categoría
                <select
                  value={dish.categoryId}
                  onChange={(event) => onChange({ ...dish, categoryId: event.target.value })}
                  className={`${fieldClass} mt-1.5`}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <Toggle
                label={dish.available ? "Visible en la carta" : "Agotado"}
                checked={dish.available}
                onChange={(available) => onChange({ ...dish, available })}
              />
              <div>
                <p className="text-sm font-medium">Foto</p>
                <ImageChoices
                  images={images}
                  selected={dish.image}
                  onSelect={(image) => onChange({ ...dish, image })}
                  onUpload={async (file) => {
                    try {
                      onChange({ ...dish, image: await onUpload(file) });
                    } catch (uploadError) {
                      onUploadError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la foto.");
                    }
                  }}
                />
              </div>
              {!dish.name.trim() && <p className="text-sm text-primary">El plato necesita un nombre.</p>}
              <button
                type="button"
                disabled={!dish.name.trim()}
                onClick={onCommit}
                className="h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Listo
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
