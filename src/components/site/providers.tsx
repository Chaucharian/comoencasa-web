"use client";

import type { ReactNode } from "react";
import { AmbientAudioProvider } from "@/components/site/ambient-audio";

export function Providers({ children }: { children: ReactNode }) {
  return <AmbientAudioProvider>{children}</AmbientAudioProvider>;
}
