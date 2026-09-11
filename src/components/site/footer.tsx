import Link from "next/link";
import { band, nav } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/site/logo";

export function Footer() {
  return (
    <footer className="relative z-[1] px-5 py-16 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Jazz rock porteño desde Almagro. El proyecto de Julio César
              Lucero. Cuatro discos. Una banda que no para de viajar.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 text-sm">
            <div className="flex flex-col gap-3">
              <p className="eyebrow">Acá</p>
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground/80 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="eyebrow">Afuera</p>
              {band.socials.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground/80 transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Cisne Elocuente · Ala Púrpura</p>
          <p>Almagro, Buenos Aires.</p>
        </div>
      </div>
    </footer>
  );
}
