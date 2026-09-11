import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import { CustomCursor } from "@/components/site/custom-cursor";
import { Footer } from "@/components/site/footer";
import { GrainOverlay } from "@/components/site/grain-overlay";
import { Header } from "@/components/site/header";
import { Providers } from "@/components/site/providers";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cisne.band"),
  title: {
    default: "Cisne Elocuente — Jazz rock porteño",
    template: "%s — Cisne Elocuente",
  },
  description:
    "El proyecto de Julio César Lucero. Jazz rock porteño desde Almagro. Letárgico, Leda, Límpida y Luz cegadora.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Cisne Elocuente — Jazz rock porteño",
    description:
      "Banda viajera de Buenos Aires. Cuatro discos. Plano verde paisaje, Ganapán, y gira 2026.",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <SmoothScroll>
            <GrainOverlay />
            <CustomCursor />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
