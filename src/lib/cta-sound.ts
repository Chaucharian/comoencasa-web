import { CTA_TRACKS } from "@/lib/assets";

let muted = false;
let index = 0;

export function setCtaSoundMuted(next: boolean) {
  muted = next;
}

export function playCtaSound() {
  if (muted || typeof window === "undefined") return;
  const src = CTA_TRACKS[index % CTA_TRACKS.length];
  index += 1;
  const sting = new Audio(src);
  sting.volume = 0.58;
  void sting.play().catch(() => undefined);
}
