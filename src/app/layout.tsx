import type { Metadata, Viewport } from "next";
import { Montserrat, Inter, Pacifico } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const script = Pacifico({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://abriyservi.com.ar"),
  title: {
    default: "abrí y serví — Comida casera envasada al vacío",
    template: "%s — abrí y serví",
  },
  description:
    "Comida casera envasada al vacío. Conectamos la cocina tradicional y de hogar con la practicidad técnica del sellado al vacío: herví la bolsa 8 minutos y disfrutá.",
  keywords: [
    "comida envasada al vacio",
    "comida casera",
    "sous vide",
    "regeneracion termica",
    "rotiseria moderna",
    "viandas mar del plata",
    "abrí y serví",
  ],
  icons: {
    icon: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
  openGraph: {
    title: "abrí y serví — Comida casera envasada al vacío",
    description:
      "De la olla al plato en 8 minutos. Platos tradicionales preparados con amor, listos para regenerar cuando quieras.",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/brand/logo.png",
        width: 757,
        height: 622,
        alt: "abrí y serví — Comida casera envasada al vacío",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#222421",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${inter.variable} ${script.variable}`}
    >
      <body className="font-sans antialiased bg-[#FFFDF2] text-[#222421] selection:bg-[#8F9E4B]/25 selection:text-[#222421]">
        {children}
      </body>
    </html>
  );
}
