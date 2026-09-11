import type { Metadata } from "next";
import { band } from "@/lib/data";
import { getUpcomingShows } from "@/lib/linktree-tour";
import { PageIntro } from "@/components/site/page-intro";
import { ShowList } from "@/components/site/show-list";
import { Button } from "@/components/ui/button";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Giras",
  description: "Próximas fechas de Cisne Elocuente, tomadas de Linktree.",
};

export default async function TourPage() {
  let shows: Awaited<ReturnType<typeof getUpcomingShows>> = [];
  try {
    shows = await getUpcomingShows();
  } catch {
    shows = [];
  }

  return (
    <>
      <PageIntro
        chapter="Próxima fecha"
        title="Fechas"
        lede="Las fechas salen de Linktree, de PRÓXIMA FECHA. Si aparece una sala, es porque la cargaron ahí."
      />
      <section className="px-5 pb-28 md:px-8">
        <div className="mx-auto max-w-7xl">
          <ShowList shows={shows} />
          <div className="mt-10">
            <Button asChild variant="outline">
              <a href={band.linktreeUrl} target="_blank" rel="noreferrer">
                Ver en Linktree
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
