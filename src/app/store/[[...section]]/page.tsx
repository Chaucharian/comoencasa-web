import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoreSection, productsForSection, storeSections } from "@/lib/store";
import { PageIntro } from "@/components/site/page-intro";
import { ProductGrid } from "@/components/store/product-grid";
import { StoreNav } from "@/components/store/store-nav";

export function generateStaticParams() {
  return [
    { section: [] },
    ...storeSections
      .filter((item) => item.slug !== "todo")
      .map((item) => ({ section: [item.slug] })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}): Promise<Metadata> {
  const { section: parts } = await params;
  const current = getStoreSection(parts?.[0]);
  if (!current) return {};

  if (current.slug === "todo") {
    return {
      title: "Tienda",
      description: "Discos, ropa y afiches de Cisne Elocuente.",
    };
  }

  return {
    title: current.label,
    description: current.lede,
  };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section: parts } = await params;
  if (parts && parts.length > 1) notFound();

  const current = getStoreSection(parts?.[0]);
  if (!current) notFound();

  return (
    <>
      <PageIntro chapter="Tienda" title={current.title} lede={current.lede} />
      <section className="px-5 pb-28 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <StoreNav section={current} />
          <ProductGrid items={productsForSection(current)} />
        </div>
      </section>
    </>
  );
}
