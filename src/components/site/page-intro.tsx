import { Reveal } from "@/components/site/reveal";

export function PageIntro({
  chapter,
  title,
  lede,
}: {
  chapter: string;
  title: string;
  lede: string;
}) {
  return (
    <section className="px-5 pt-32 pb-16 md:px-8 md:pt-40">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="eyebrow">{chapter}</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-tight md:text-8xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {lede}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
