import { streaming } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";
import { ArrowUpRight } from "lucide-react";

export function Listen() {
  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="eyebrow">Plano verde paisaje · 2,5 millones</p>
          <h2 className="mt-4 font-display text-5xl tracking-tight md:text-7xl">
            Escuchar
          </h2>
        </Reveal>
        <div className="mt-12 divide-y divide-foreground/10 border-y border-foreground/10">
          {streaming.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.06}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between py-7 transition-colors hover:text-primary"
              >
                <span className="font-display text-3xl md:text-5xl">
                  {item.label}
                </span>
                <span className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground group-hover:text-primary">
                  Abrir
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
