import Image from "next/image";
import Link from "next/link";
import { type Album, albumSpecs } from "@/lib/data";
import { Button } from "@/components/ui/button";

export function AlbumSpecList({ album }: { album: Album }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      {albumSpecs(album).map((spec) => (
        <div key={spec.label}>
          <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            {spec.label}
          </dt>
          <dd className="mt-1 text-sm text-muted-foreground">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AlbumCard({
  album,
  index,
}: {
  album: Album;
  index: number;
}) {
  return (
    <article className="flex h-full flex-col">
      <Link href={`/discography/${album.slug}`} className="group flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <Image
            src={album.image}
            alt={`Tapa de ${album.title}`}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 44vw, 90vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
          Disco {album.chapter}
        </p>
        <h3 className="mt-2 font-display text-3xl leading-none">{album.title}</h3>
        <div className="mt-5 flex-1">
          <AlbumSpecList album={album} />
        </div>
      </Link>
      <Button asChild variant="outline" className="mt-6 w-full">
        <Link href={`/discography/${album.slug}`}>Abrir disco {index + 1}</Link>
      </Button>
    </article>
  );
}
