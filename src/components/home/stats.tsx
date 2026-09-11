import { stats } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";

export function Stats() {
  return (
    <section className="border-y border-foreground/8 px-5 py-14 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.06}>
            <p className="font-display text-5xl tracking-tight text-primary md:text-6xl">
              {stat.value}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
