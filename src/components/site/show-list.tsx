import { type Show, showStatusLabel } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ShowList({
  shows,
  limit,
}: {
  shows: Show[];
  limit?: number;
}) {
  const items = limit ? shows.slice(0, limit) : shows;

  if (items.length === 0) {
    return (
      <p className="border-y border-foreground/10 py-10 text-muted-foreground">
        No hay fechas cargadas en Linktree por ahora.
      </p>
    );
  }

  return (
    <div className="divide-y divide-foreground/10 border-y border-foreground/10">
      {items.map((show, index) => (
        <Reveal key={`${show.city}-${show.date}-${show.venue}`} delay={index * 0.03}>
          <div className="grid items-center gap-4 py-7 md:grid-cols-12">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground md:col-span-3">
              {show.date}
            </p>
            <div className="md:col-span-4">
              <h2 className="font-display text-3xl md:text-4xl">{show.city}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{show.country}</p>
            </div>
            <p className="text-sm text-muted-foreground md:col-span-3">{show.venue}</p>
            <div className="flex items-center gap-3 md:col-span-2 md:justify-end">
              <Badge variant={show.status === "sold out" ? "rust" : "default"}>
                {showStatusLabel[show.status]}
              </Badge>
              {show.status === "on sale" ? (
                <Button asChild size="sm" variant="outline">
                  <a href={show.href} target="_blank" rel="noreferrer">
                    Entradas
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
