"use client";

import { useEffect, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { useIntro } from "@/components/site/intro-context";

function LenisSync() {
  const lenis = useLenis();
  const { active } = useIntro();

  useEffect(() => {
    if (!lenis) return;

    if (active) {
      lenis.stop();
      return;
    }

    document.documentElement.style.removeProperty("overflow");
    lenis.resize();
    lenis.start();
  }, [active, lenis]);

  useEffect(() => {
    if (!lenis) return;

    const resize = () => lenis.resize();
    const observer = new ResizeObserver(resize);
    observer.observe(document.body);
    window.addEventListener("load", resize);

    return () => {
      observer.disconnect();
      window.removeEventListener("load", resize);
    };
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: true,
        autoResize: true,
        allowNestedScroll: true,
      }}
    >
      <LenisSync />
      {children}
    </ReactLenis>
  );
}
