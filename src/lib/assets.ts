import { albums, gallery, photos, products } from "@/lib/data";

// export const INTRO_TRACK = "/music/Arpegio.mp3";
export const INTRO_TRACK = "/music/Apertura.mp3";

export const HERO_IMAGE = photos.hero;
export const BAND_IMAGE = photos.band;

const CRITICAL_IMAGES = [
  "/brand/cisne-elocuente.png?v=3",
  HERO_IMAGE,
  BAND_IMAGE,
  ...albums.map((album) => album.image),
  ...products.slice(0, 4).map((product) => product.image),
  ...gallery.map((photo) => photo.src),
];

function whenWindowLoaded() {
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

function loadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

function loadTrack(src: string) {
  return new Promise<void>((resolve) => {
    const audio = new Audio();
    audio.preload = "auto";
    const done = () => resolve();
    audio.addEventListener("canplaythrough", done, { once: true });
    audio.addEventListener("error", done, { once: true });
    audio.src = src;
    audio.load();
  });
}

export async function waitForAssets() {
  if (typeof window === "undefined") return;

  await Promise.all([
    whenWindowLoaded(),
    document.fonts?.ready ?? Promise.resolve(),
    loadTrack(INTRO_TRACK),
    ...[...new Set(CRITICAL_IMAGES)].map(loadImage),
  ]);
}
