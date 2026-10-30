import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center bg-background px-6 text-center">
      <p className="text-sm font-script text-[#8F9E4B] text-xl">abrí y serví</p>
      <h1 className="mt-2 font-heading font-black text-4xl text-[#222421] uppercase">Esta página no existe.</h1>
      <Link href="/" className="mt-6 rounded-full bg-[#8F9E4B] px-6 py-3 text-xs font-heading font-bold uppercase tracking-wider text-[#FFFDF2] hover:bg-[#7D8B3F] transition-colors shadow-md">
        Volver a la carta
      </Link>
    </main>
  );
}
