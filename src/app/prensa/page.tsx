import type { Metadata } from "next";
import Image from "next/image";
import {
  band,
  pressBio,
  pressLogo,
  riderBackline,
  riderDrums,
  riderInputs,
  riderMonitors,
} from "@/lib/data";
import { StagePlot } from "@/components/press/stage-plot";
import { MemberList } from "@/components/site/member-list";
import { PageIntro } from "@/components/site/page-intro";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Prensa",
  description:
    "Contacto, formación y rider técnico de Cisne Elocuente.",
};

function SpecList({
  title,
  items,
}: {
  title: string;
  items: readonly { n?: string; name?: string; item?: string; spec?: string }[];
}) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-6 divide-y divide-foreground/10 border-y border-foreground/10">
        {items.map((row) => (
          <li
            key={row.n ?? row.item ?? row.name}
            className="grid grid-cols-[4.5rem_1fr] items-baseline gap-4 py-3.5 md:grid-cols-[5rem_1fr_auto]"
          >
            <span className="font-mono text-[11px] text-primary">
              {row.n ?? "—"}
            </span>
            <span className="font-display text-xl leading-none">
              {row.name ?? row.item}
            </span>
            {row.spec ? (
              <span className="col-span-2 text-sm text-muted-foreground md:col-span-1 md:text-right">
                {row.spec}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PressPage() {
  return (
    <>
      <PageIntro
        chapter="Press kit"
        title="Prensa"
        lede="Contacto para notas y booking, y el armado de la banda en el escenario."
      />

      <section className="px-5 pb-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow">Contacto</p>
            <h2 className="mt-4 font-display text-4xl md:text-6xl">
              Escribinos.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              {pressBio}
            </p>
            <a
              href={`mailto:${band.email}`}
              className="mt-8 block font-display text-3xl text-primary transition-colors hover:text-foreground md:text-5xl"
            >
              {band.email}
            </a>
            <p className="mt-4 text-sm text-muted-foreground">
              Prensa, booking y rider. Almagro, Buenos Aires.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <a href={`mailto:${band.email}`}>Escribir</a>
              </Button>
              <Button asChild variant="outline">
                <a href={band.spotifyUrl} target="_blank" rel="noreferrer">
                  Spotify
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={pressLogo.href} download="cisne-elocuente.png">
                  Logo
                </a>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5">
            <p className="eyebrow">El cuarteto</p>
            <div className="mt-6">
              <MemberList />
            </div>
            <div className="mt-10 flex items-center justify-center bg-ink py-10">
              <Image
                src={pressLogo.href}
                alt={pressLogo.alt}
                width={420}
                height={160}
                className="h-auto w-56"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pb-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="eyebrow">Armado</p>
            <h2 className="mt-4 font-display text-4xl md:text-6xl">
              Cómo se planta la banda
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground text-pretty">
              Cuarteto. Backline a cargo de la banda. Pistas por la PC.
              El plot es desde el público.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="mt-10">
            <StagePlot />
          </Reveal>
        </div>
      </section>

      <section className="px-5 pb-16 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
          <Reveal>
            <SpecList title="Entradas" items={riderInputs} />
          </Reveal>
          <Reveal delay={0.06}>
            <SpecList title="Batería" items={riderDrums} />
          </Reveal>
        </div>
      </section>

      <section className="px-5 pb-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="eyebrow">A cargo de la banda</p>
            <h2 className="mt-4 font-display text-4xl">Backline</h2>
            <ul className="mt-8 divide-y divide-foreground/10 border-y border-foreground/10">
              {riderBackline.map((row) => (
                <li
                  key={row.item}
                  className="flex flex-col justify-between gap-1 py-5 md:flex-row md:items-baseline"
                >
                  <span className="font-display text-2xl">{row.item}</span>
                  <span className="text-sm text-muted-foreground">{row.spec}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pb-28 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="eyebrow">Monitoreo</p>
            <h2 className="mt-4 font-display text-4xl">Mezclas</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {riderMonitors.map((row, index) => (
              <Reveal key={row.who} delay={index * 0.05}>
                <article className="border-t border-foreground/12 pt-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-3xl">{row.who}</h3>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                      {row.count}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {row.mix}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
