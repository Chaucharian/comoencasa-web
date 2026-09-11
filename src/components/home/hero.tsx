"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BandLogo } from "@/components/site/band-logo";
import { HERO_IMAGE, HERO_VIDEO } from "@/lib/assets";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center">
      <div className="absolute inset-3 overflow-hidden rounded-3xl md:inset-5 md:rounded-[2rem]">
        {reduce ? (
          <Image
            src={HERO_IMAGE}
            alt="Cisne Elocuente, los cuatro entre los pastos"
            fill
            priority
            className="object-cover scale-105"
          />
        ) : (
          <video
            className="absolute inset-0 size-full scale-110 object-cover blur-[2.5px]"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_IMAGE}
            aria-hidden
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/50 to-ink/80" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-primary/10 to-transparent" />
        <div className="vignette" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-28 h-56 bg-gradient-to-b from-primary/18 via-primary/6 to-transparent blur-2xl"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-28 text-center md:px-8">
        <motion.p
          className="eyebrow"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Jazz rock porteño
        </motion.p>

        <motion.h1
          className="mt-8 w-full max-w-5xl"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="sr-only">CISNE ELOCUENTE</span>
          <BandLogo className="mx-auto w-full" />
        </motion.h1>

        <motion.div
          className="mt-8 flex max-w-2xl flex-col items-center gap-8"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
        >
          <p className="max-w-md text-lg leading-relaxed text-bone/80 text-pretty md:text-xl">
            El proyecto de Julio César Lucero. Cuatro discos, una banda
            viajera, y esa identidad indescifrable del jazz rock porteño.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/discography">Los discos</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/tour">Gira 2026</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      <a
        href="#banda"
        className="absolute bottom-8 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-foreground/60 transition-colors hover:text-primary md:bottom-10"
      >
        <ArrowDown className="size-4 animate-bounce" />
        Bajar a la ciudad
      </a>
    </section>
  );
}
