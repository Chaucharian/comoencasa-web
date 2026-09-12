import Image from "next/image";
import type { Product } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";

export function ProductGrid({ items }: { items: readonly Product[] }) {
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
