import Link from "next/link";
import { storeSections, type StoreSection } from "@/lib/store";
import { cn } from "@/lib/utils";

export function StoreNav({ section }: { section: StoreSection }) {
  return (
    <nav
      aria-label="Secciones de la tienda"
      className="inline-flex flex-wrap items-center gap-6 border-b border-foreground/10"
    >
      {storeSections.map((item) => {
        const active = item.slug === section.slug;

        return (
          <Link
            key={item.slug}
            href={item.path}
            className={cn(
              "relative -mb-px pb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground",
              active && "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-primary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
