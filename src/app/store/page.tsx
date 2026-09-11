import type { Metadata } from "next";
import Image from "next/image";
import { products } from "@/lib/data";
import { PageIntro } from "@/components/site/page-intro";
import { Reveal } from "@/components/site/reveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Discos, remeras y afiches de Cisne Elocuente. Bandcamp y objetos de gira.",
};

const categories = [
  { id: "all", label: "Todo" },
  { id: "vinyl", label: "Discos" },
  { id: "wear", label: "Ropa" },
  { id: "archive", label: "Papel" },
] as const;

function ProductGrid({
  items,
}: {
  items: typeof products;
}) {
  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((product, index) => (
        <Reveal key={product.slug} delay={index * 0.05}>
          <a href={product.href} target="_blank" rel="noreferrer" className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
              {product.edition}
            </p>
            <div className="mt-2 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl leading-tight">{product.title}</h2>
              <span className="shrink-0 text-sm text-muted-foreground">{product.price}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{product.blurb}</p>
          </a>
        </Reveal>
      ))}
    </div>
  );
}

export default function StorePage() {
  return (
    <>
      <PageIntro
        chapter="Tienda"
        title="Discos y objetos"
        lede="Letárgico y Leda en Bandcamp. Límpida y Luz cegadora en las plataformas. Algún trapo de gira."
      />
      <section className="px-5 pb-28 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Tabs defaultValue="all">
            <TabsList>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all">
              <ProductGrid items={products} />
            </TabsContent>
            {categories
              .filter((category) => category.id !== "all")
              .map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <ProductGrid
                    items={products.filter((item) => item.category === category.id)}
                  />
                </TabsContent>
              ))}
          </Tabs>
        </div>
      </section>
    </>
  );
}
