import Image from "next/image";
import { gallery } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";

export function PhotoGallery() {
  return (
    <section className="px-5 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="eyebrow">Fotos</p>
          <h2 className="mt-4 font-display text-4xl md:text-6xl">La banda, el escenario</h2>
        </Reveal>
        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {gallery.map((photo, index) => (
            <Reveal key={photo.src} delay={index * 0.03} className="mb-4 break-inside-avoid">
              <figure className="relative overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={900}
                  height={1200}
                  className="h-auto w-full object-cover"
                />
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
