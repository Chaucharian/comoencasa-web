"use client";

import type { ReactNode } from "react";
import { AmbientAudioProvider } from "@/components/site/ambient-audio";
import { IntroProvider } from "@/components/site/intro-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <IntroProvider>
      <AmbientAudioProvider>{children}</AmbientAudioProvider>
    </IntroProvider>
  );
}
