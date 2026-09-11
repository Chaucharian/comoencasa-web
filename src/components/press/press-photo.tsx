import Image from "next/image";
import { cn } from "@/lib/utils";

export function PressPhoto({
  src,
  alt,
  caption,
  note,
  priority = false,
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  caption: string;
  note?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}) {
  const filename = src.split("/").pop() ?? "foto.jpg";

  return (
    <figure className={cn("group relative h-full overflow-hidden bg-secondary", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className={cn("object-cover transition-transform duration-700 group-hover:scale-105", imageClassName)}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent opacity-80" />
      <figcaption className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5">
        <div>
          <p className="font-display text-2xl leading-none">{caption}</p>
          {note ? (
            <p className="mt-2 max-w-xs text-sm text-bone/70">{note}</p>
          ) : null}
        </div>
        <a
          href={src}
          download={filename}
          className="pointer-events-auto font-mono text-[10px] uppercase tracking-[0.22em] text-bone/80 transition-colors hover:text-primary"
        >
          Bajar
        </a>
      </figcaption>
    </figure>
  );
}
