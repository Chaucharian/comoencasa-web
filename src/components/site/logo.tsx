import Link from "next/link";
import { BandLogo } from "@/components/site/band-logo";
import { cn } from "@/lib/utils";

export function SwanMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 32"
      fill="none"
      aria-hidden
      className={cn("text-primary", className)}
    >
      <path
        d="M4 24c8-1 12-8 16-8 3 0 4 4 8 4 7 0 10-10 18-12 6-1.5 12 2 14 6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M38 10c2 3 3 7 1 10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="56" cy="14" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center text-foreground", className)}
    >
      <span className="sr-only">CISNE ELOCUENTE</span>
      <BandLogo
        glow={false}
        className="h-9 w-[4.6rem] transition-transform duration-500 group-hover:translate-x-0.5 md:h-11 md:w-[5.6rem]"
      />
    </Link>
  );
}
