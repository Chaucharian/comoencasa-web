import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { albums, band, getAlbum } from "@/lib/data";
import { AlbumSpecList } from "@/components/site/album-card";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function generateStaticParams() {
  return albums.map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = getAlbum(slug);
  if (!album) return {};
  return {
    title: album.title,
    description: album.statement,
  };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = getAlbum(slug);
  if (!album) notFound();

  const index = albums.findIndex((item) => item.slug === album.slug);
  const next = albums[(index + 1) % albums.length];

  return (
    <article className="pt-28 md:pt-32">
      <section className="px-5 pb-8 md:px-8">
        <div className="mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-12">
          <div className="relative aspect-square overflow-hidden bg-secondary lg:col-span-5">
            <Image
              src={album.image}
              alt={`Tapa de ${album.title}`}
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="lg:col-span-7 lg:pb-4">
            <p className="eyebrow">
              Disco {album.chapter} · {album.year}
            </p>
            <h1 className="mt-4 font-display text-6xl leading-[0.9] md:text-8xl">
              {album.title}
            </h1>
            <p className="mt-5 max-w-xl text-xl text-muted-foreground">{album.statement}</p>
            <div className="mt-8 max-w-lg">
              <AlbumSpecList album={album} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Badge>{album.label}</Badge>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
              {album.story}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <a href={band.spotifyUrl} target="_blank" rel="noreferrer">
                  Escuchar
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={band.storeUrl} target="_blank" rel="noreferrer">
                  Bandcamp
                </a>
              </Button>
            </div>
            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {album.duration} · {album.songs} temas · {album.recorded}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <ol>
              {album.tracks.map((track) => (
                <li
                  key={track.n}
                  className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-b border-foreground/10 py-4"
                >
                  <span className="font-mono text-xs text-primary">{track.n}</span>
                  <span className="font-display text-2xl">{track.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {track.time}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <Separator />
      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Siguiente disco</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">{next.title}</h2>
          </div>
          <Button asChild variant="outline">
            <Link href={`/discography/${next.slug}`}>Seguir</Link>
          </Button>
        </div>
      </section>
    </article>
  );
}
