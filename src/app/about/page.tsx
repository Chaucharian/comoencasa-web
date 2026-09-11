import type { Metadata } from "next";
import Image from "next/image";
import { members, photos } from "@/lib/data";
import { PageIntro } from "@/components/site/page-intro";
import { PhotoGallery } from "@/components/site/photo-gallery";
import { Reveal } from "@/components/site/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "La banda",
  description:
    "Cisne Elocuente, el proyecto de Julio César Lucero. Jazz rock porteño desde Almagro, 2014.",
};

export default function AboutPage() {
  return (
    <>
      <PageIntro
        chapter="La banda"
        title="Cisne Elocuente"
        lede="No es solo una banda: es un viaje en el tiempo, una experiencia audiovisual, jazz rock porteño con alma de los ochenta."
      />

      <section className="px-5 pb-16 md:px-8">
        <Reveal>
          <div className="relative mx-auto aspect-[16/8] max-w-7xl overflow-hidden">
            <Image
              src={photos.bandMirror}
              alt="Cisne Elocuente, vista desde arriba"
              fill
              className="object-cover"
            />
          </div>
        </Reveal>
      </section>

      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
          <Reveal className="space-y-6 text-lg leading-relaxed text-muted-foreground lg:col-span-7">
            <p>
              Julio César Lucero dirige la estética y el sonido. Compone,
              produce, canta y toca la guitarra. El proyecto nació a
              principios de 2014 en Almagro. En 2019 se disolvió. Tres años
              después Lucero lo levantó de nuevo, con otras formaciones,
              hasta que en 2024 se afirmó este cuarteto.
            </p>
            <p>
              Letárgico (2015) se grabó entre Almagro, Quilmes y Chapadmalal.
              Leda (2017) salió de Casa Cisne, en Boedo, y se terminó en el
              Estudio del Nuevo Mundo por invitación de Litto Nebbia. Límpida
              (2022) fue el disco del regreso. Luz cegadora (2026) cierra esa
              etapa y abre otra.
            </p>
            <p>
              Siempre fueron viajeros: el mapa nacional — Buenos Aires, La
              Plata, Córdoba, Rosario, Santa Fe, Neuquén, Jujuy, Bahía Blanca
              — y también Brasil, Uruguay y Chile. En 2025 tocaron frente a
              quinientas personas en Santiago, la primera vez. Plano verde
              paisaje pasó los 2,5 millones de reproducciones. En Spotify hay
              más de ochenta mil oyentes. El primer videoclip, Ganapán, es un
              cortometraje en un pasaje de Congreso: euforia, existencialismo,
              rock y tango.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <p className="eyebrow">Desde 2024</p>
            <ul className="mt-6 divide-y divide-foreground/10 border-y border-foreground/10">
              {members.map((member) => (
                <li key={member.name} className="flex items-baseline justify-between gap-4 py-5">
                  <span className="font-display text-2xl">{member.name}</span>
                  <span className="text-right text-sm text-muted-foreground">
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <PhotoGallery />

      <section className="px-5 pb-28 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="eyebrow">Preguntas</p>
            <h2 className="mt-4 font-display text-4xl">Lo que suelen preguntar</h2>
          </Reveal>
          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="name">
              <AccordionTrigger className="font-display text-2xl">
                ¿Por qué Cisne Elocuente?
              </AccordionTrigger>
              <AccordionContent>
                El cisne que habla. Lucero escribe, produce y marca el
                sonido: la elocuencia es la de las canciones, no la del
                discurso. Jazz rock porteño, letras que van del letargo al
                ganapán.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="order">
              <AccordionTrigger className="font-display text-2xl">
                ¿Por dónde empiezo a escuchar?
              </AccordionTrigger>
              <AccordionContent>
                Plano verde paisaje si querés el tema que ya viajó solo.
                Ganapán si querés el Cisne de 2026. Letárgico si querés la
                ventana de Almagro. Leda si tenés una hora y ganas de irte
                lejos.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="live">
              <AccordionTrigger className="font-display text-2xl">
                ¿Cómo suenan en vivo?
              </AccordionTrigger>
              <AccordionContent>
                Como una banda que recorrió el país y cruzó la cordillera.
                No es un concierto de salón: es gira. Guitarra, bajo,
                batería, teclado. Rock nacional con tango en los bordes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="store">
              <AccordionTrigger className="font-display text-2xl">
                ¿Dónde están los discos?
              </AccordionTrigger>
              <AccordionContent>
                Letárgico y Leda viven en Bandcamp. Límpida y Luz cegadora,
                en las plataformas. La tienda junta eso y algunos objetos
                de gira.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </>
  );
}
