import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center bg-background px-6 text-center">
      <p className="text-sm font-medium text-primary">Como en Casa</p>
      <h1 className="mt-2 font-display text-5xl">Esta página no está.</h1>
      <Link href="/" className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
        Volver a la carta
      </Link>
    </main>
  );
}
