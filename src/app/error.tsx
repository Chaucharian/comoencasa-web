"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="font-display text-5xl">La carta no carga</h1>
      <p className="mt-3 max-w-xs text-muted-foreground">Volvé a intentar en un momento.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
      >
        Reintentar
      </button>
    </main>
  );
}
