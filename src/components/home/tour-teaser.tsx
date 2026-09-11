import Link from "next/link";
import { getUpcomingShows } from "@/lib/linktree-tour";
import { ShowList } from "@/components/site/show-list";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";

export async function TourTeaser() {
  let shows: Awaited<ReturnType<typeof getUpcomingShows>> = [];
  try {
    shows = await getUpcomingShows();
  } catch {
    shows = [];
  }

  return (
    <section className="relative px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Próxima fecha</p>
              <h2 className="mt-4 font-display text-5xl tracking-tight md:text-7xl">
                Giras
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/tour">Todas las fechas</Link>
            </Button>
          </div>
        </Reveal>
        <div className="mt-12">
          <ShowList shows={shows} limit={5} />
        </div>
      </div>
    </section>
  );
}
