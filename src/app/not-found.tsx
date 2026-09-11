import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">Calle sin nombre</p>
      <h1 className="mt-4 font-display text-6xl md:text-8xl">Te perdiste.</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Esta página no está en el mapa. Volvé al barrio, o empezá de nuevo.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Volver a Cisne Elocuente</Link>
      </Button>
    </section>
  );
}
