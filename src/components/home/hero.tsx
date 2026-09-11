"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BandLogo } from "@/components/site/band-logo";
import { SwanMark } from "@/components/site/logo";
import { HERO_IMAGE } from "@/lib/assets";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden">
      <Image
        src={HERO_IMAGE}
        alt="Cisne Elocuente, los cuatro entre los pastos"
        fill
        priority
        className="object-cover scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/35 via-ink/60 to-ink" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-primary/20 to-transparent" />
      <div className="vignette" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-32 md:px-8 md:pb-20">
        <motion.p
          className="eyebrow"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Jazz rock porteño
        </motion.p>

        <motion.div
          className="mt-6 flex items-center gap-4"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.35 }}
        >
          <SwanMark className="h-5 w-10" />
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-foreground/70">
            Almagro · Buenos Aires · 2014—2026
          </span>
        </motion.div>

        <motion.h1
          className="mt-6 w-full max-w-4xl"
          initial={reduce ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="sr-only">CISNE ELOCUENTE</span>
          <BandLogo className="w-full" />
        </motion.h1>

        <motion.div
          className="mt-6 flex max-w-2xl flex-col gap-8 md:flex-row md:items-end md:justify-between"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
        >
          <p className="max-w-md text-lg leading-relaxed text-bone/80 text-pretty md:text-xl">
            El proyecto de Julio César Lucero. Cuatro discos, una banda
            viajera, y esa identidad indescifrable del jazz rock porteño.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/discography">Los discos</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/tour">Gira 2026</Link>
            </Button>
          </div>
        </motion.div>

        <a
          href="#banda"
          className="mt-16 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-foreground/60 transition-colors hover:text-primary"
        >
          <ArrowDown className="size-4 animate-bounce" />
          Bajar a la ciudad
        </a>
      </div>
    </section>
  );
}
