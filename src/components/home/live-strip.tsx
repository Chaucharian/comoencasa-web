import Image from "next/image";
import { gallery } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";

const live = gallery.filter((photo) => photo.src.includes("/vivo-"));

export function LiveStrip() {
  return (
    <section className="border-y border-foreground/8 py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <p className="eyebrow">En el escenario</p>
          <h2 className="mt-4 font-display text-5xl tracking-tight md:text-7xl">
            En vivo
          </h2>
        </Reveal>
      </div>
      <div className="mt-10 flex gap-3 overflow-x-auto px-5 pb-2 snap-x snap-mandatory scrollbar-none md:px-8">
        {live.map((photo) => (
          <figure
            key={photo.src}
            className="relative aspect-[3/4] min-w-[70vw] snap-start overflow-hidden md:min-w-[28vw] lg:min-w-[18vw]"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
