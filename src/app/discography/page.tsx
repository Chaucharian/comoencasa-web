import type { Metadata } from "next";
import { albums } from "@/lib/data";
import { AlbumCard } from "@/components/site/album-card";
import { PageIntro } from "@/components/site/page-intro";
import { Reveal } from "@/components/site/reveal";

export const metadata: Metadata = {
  title: "Discografía",
  description: "Letárgico, Leda, Límpida y Luz cegadora — los cuatro discos de Cisne Elocuente.",
};

export default function DiscographyPage() {
  return (
    <>
      <PageIntro
        chapter="Cuatro discos"
        title="Discografía"
        lede="Del letargo de Almagro a la luz cegadora. Empezá por Plano verde paisaje o por Ganapán."
      />
      <section className="px-5 pb-28 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {albums.map((album, index) => (
            <Reveal key={album.slug} delay={index * 0.06} className="h-full">
              <AlbumCard album={album} index={index} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
