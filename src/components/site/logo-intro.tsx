"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useAmbientAudio } from "@/components/site/ambient-audio";
import { BandLogo } from "@/components/site/band-logo";
import { waitForAssets } from "@/lib/assets";

export function LogoIntro() {
  const reduce = useReducedMotion();
  const { play } = useAmbientAudio();
  const [assetsReady, setAssetsReady] = useState(false);
  const [phase, setPhase] = useState<"playing" | "leaving" | "gone">("playing");
  const enteringRef = useRef(false);
  const playRef = useRef(play);

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    let cancelled = false;
    waitForAssets().then(() => {
      if (!cancelled) setAssetsReady(true);
    });

    return () => {
      cancelled = true;
      document.documentElement.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;
    const gone = window.setTimeout(() => setPhase("gone"), 800);
    return () => window.clearTimeout(gone);
  }, [phase]);

  useEffect(() => {
    if (phase === "gone") {
      document.documentElement.style.overflow = "";
    }
  }, [phase]);

  const enter = useCallback(() => {
    if (enteringRef.current) return;
    enteringRef.current = true;
    void playRef.current();
    setPhase("leaving");
  }, []);

  const activate = useCallback(() => {
    void playRef.current();
    enter();
  }, [enter]);

  useEffect(() => {
    if (phase !== "playing") return;

    const onKey = (event: KeyboardEvent) => {
      if (
        event.key !== "Enter" &&
        event.key !== " " &&
        event.key !== "ArrowDown" &&
        event.key !== "PageDown"
      ) {
        return;
      }
      event.preventDefault();
      activate();
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 2 && Math.abs(event.deltaX) < 2) return;
      event.preventDefault();
      activate();
    };

    const onPointer = () => {
      activate();
    };

    window.addEventListener("keydown", onKey, true);
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    window.addEventListener("touchstart", onPointer, { capture: true, passive: true });
    window.addEventListener("pointerdown", onPointer, true);

    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("touchstart", onPointer, true);
      window.removeEventListener("pointerdown", onPointer, true);
    };
  }, [activate, phase]);

  if (phase === "gone") return null;

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink px-6"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "leaving" ? 0 : 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden={phase !== "playing"}
    >
      <div className="w-full max-w-5xl">
        <p className="eyebrow mb-8 text-center">
          {assetsReady ? "Scroll o Enter" : "Afinando"}
        </p>
        <BandLogo
          animated
          looping={!assetsReady && !reduce}
          className="mx-auto w-full"
        />
      </div>
      <button
        type="button"
        onClick={activate}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.32em] text-foreground/40 transition-colors hover:text-primary"
      >
        Scroll o Enter
      </button>
    </motion.div>
  );
}
