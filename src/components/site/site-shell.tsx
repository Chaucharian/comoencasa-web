"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CustomCursor } from "@/components/site/custom-cursor";
import { Footer } from "@/components/site/footer";
import { GrainOverlay } from "@/components/site/grain-overlay";
import { Header } from "@/components/site/header";
import { LogoIntro } from "@/components/site/logo-intro";
import { useIntro } from "@/components/site/intro-context";

export function SiteShell({ children }: { children: ReactNode }) {
  const { active } = useIntro();
  const pathname = usePathname();

  return (
    <>
      {pathname === "/" ? <LogoIntro /> : null}
      {active ? null : <div className="atmosphere" aria-hidden />}
      {active ? null : <GrainOverlay />}
      {active ? null : <CustomCursor />}
      {active ? null : <Header />}
      <main className="relative z-[1] flex-1">{children}</main>
      {active ? null : <Footer />}
    </>
  );
}
