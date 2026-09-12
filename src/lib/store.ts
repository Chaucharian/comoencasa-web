import { products, type Product } from "@/lib/data";

export const storeSections = [
  {
    slug: "todo",
    path: "/store",
    category: null,
    label: "Todo",
    title: "Discos y objetos",
    lede: "Discos, ropa y afiches.",
  },
  {
    slug: "discos",
    path: "/store/discos",
    category: "vinyl",
    label: "Discos",
    title: "Discos",
    lede: "Los cuatro LPs.",
  },
  {
    slug: "ropa",
    path: "/store/ropa",
    category: "wear",
    label: "Ropa",
    title: "Ropa",
    lede: "Remeras, buzos y gorras.",
  },
  {
    slug: "objetos",
    path: "/store/objetos",
    category: "archive",
    label: "Objetos",
    title: "Objetos",
    lede: "Afiches, tote y taza.",
  },
] as const;

export type StoreSection = (typeof storeSections)[number];

export function getStoreSection(slug?: string): StoreSection | undefined {
  if (!slug || slug === "todo") return storeSections[0];
  return storeSections.find((section) => section.slug === slug);
}

export function productsForSection(section: StoreSection): Product[] {
  if (!section.category) return products;
  return products.filter((item) => item.category === section.category);
}
