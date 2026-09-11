import { albums } from "@/lib/data";
import { AlbumCard } from "@/components/site/album-card";
import { Reveal } from "@/components/site/reveal";

export function Chapters() {
  return (
    <section className="border-y border-foreground/8">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">I—IV</p>
              <h2 className="mt-4 font-display text-5xl tracking-tight md:text-7xl">
                Discografía
              </h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              Letárgico, Leda, Límpida y Luz cegadora. Empezá por el plano
              verde o por el videoclip de Ganapán. El orden es un viaje, no
              una obligación.
            </p>
          </div>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {albums.map((album, index) => (
            <Reveal key={album.slug} delay={index * 0.05} className="h-full">
              <AlbumCard album={album} index={index} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
