import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const sans = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Como en Casa — comida casera",
    template: "%s — Como en Casa",
  },
  description:
    "Tartas, horno y platos del día para retirar o recibir en casa. El pedido se confirma por WhatsApp.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Como en Casa — comida casera",
    description: "Pedí para retirar o delivery. Lo confirmamos por WhatsApp.",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
