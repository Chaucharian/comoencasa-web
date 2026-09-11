import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { BAND_IMAGE } from "@/lib/assets";

export function Myth() {
  return (
    <section id="banda" className="px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow">La banda</p>
          <h2 className="mt-5 font-display text-5xl leading-[0.95] tracking-tight md:text-6xl">
            Nació en Almagro. Nunca dejó de viajar.
          </h2>
        </Reveal>
        <Reveal delay={0.12} className="lg:col-span-7">
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            <p>
              Cisne Elocuente es el proyecto de Julio César Lucero: él dirige
              la estética y el sonido de este grupo de jazz rock porteño.
              Empezó a principios de 2014 en Almagro. En 2019 se disolvió. En
              2022 Lucero lo retomó.
            </p>
            <p>
              Desde 2024 la formación se sostiene: Lucero en guitarra y voz,
              Lucas Manzo en bajo, Federico Volpi en batería, Lucas Llull en
              teclado. Cuatro discos — Letárgico, Leda, Límpida y Luz
              cegadora — y una costumbre de tocar lejos de casa.
            </p>
            <p>
              Buenos Aires, La Plata, Córdoba, Rosario, Santa Fe, Neuquén,
              Jujuy, Bahía Blanca. También Brasil, Uruguay y Chile. En 2025,
              quinientas personas en Santiago: la primera vez en esa ciudad.
              Si amás la música rioplatense, hay que verlos en un escenario.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/about">La historia completa</Link>
          </Button>
        </Reveal>
        <Reveal delay={0.08} className="relative aspect-[16/10] overflow-hidden lg:col-span-12">
          <Image
            src={BAND_IMAGE}
            alt="Cisne Elocuente, los cuatro de perfil"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          <p className="absolute bottom-6 left-6 font-mono text-[11px] uppercase tracking-[0.28em] text-bone/80">
            La formación · 2024
          </p>
        </Reveal>
      </div>
    </section>
  );
}
