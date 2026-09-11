import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";

export function StoreTeaser() {
  const featured = products.slice(0, 4);

  return (
    <section className="relative px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Bandcamp y objetos</p>
              <h2 className="mt-4 font-display text-5xl tracking-tight md:text-7xl">
                Tienda
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/store">Entrar a la tienda</Link>
            </Button>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, index) => (
            <Reveal key={product.slug} delay={index * 0.06}>
              <a
                href={product.href}
                target="_blank"
                rel="noreferrer"
                className="group block"
              >
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
                <h3 className="mt-2 font-display text-2xl leading-tight">
                  {product.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{product.price}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
