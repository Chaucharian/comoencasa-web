import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Phone, ShieldCheck } from "lucide-react";
import type { Store } from "@/lib/types";

export function Footer({ store }: { store: Store }) {
  return (
    <footer className="w-full bg-[#222421] text-[#FFFDF2] pt-16 pb-12 border-t border-[#8F9E4B]/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-[#FFFDF2]/15">
          {/* Brand Column (5 cols) */}
          <div className="md:col-span-5">
            <div className="mb-5">
              <Link href="#" className="inline-block group" title="abrí y serví — Inicio">
                <Image
                  src="/brand/logo-cream.png"
                  alt="abrí y serví"
                  width={210}
                  height={68}
                  className="h-11 sm:h-12 w-auto object-contain"
                />
              </Link>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#8F9E4B] font-heading mt-2">
                Comida casera envasada al vacío
              </p>
            </div>

            <p className="font-sans text-xs sm:text-sm text-[#FFFDF2]/75 leading-relaxed max-w-sm mb-6">
              {store.about}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8F9E4B]/20 border border-[#8F9E4B]/40 text-xs font-heading font-bold text-[#8F9E4B]">
              <ShieldCheck size={14} />
              <span>Calidad Bromatológica & Atmósfera Protegida</span>
            </div>
          </div>

          {/* Quick Links Column (3 cols) */}
          <div className="md:col-span-3">
            <h4 className="font-heading font-black text-xs uppercase tracking-widest text-[#8F9E4B] mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-[#FFFDF2]/80">
              <li>
                <a href="#metodo" className="hover:text-[#8F9E4B] transition-colors">
                  El Ritual (8 min)
                </a>
              </li>
              <li>
                <a href="#platos-estrella" className="hover:text-[#8F9E4B] transition-colors">
                  Platos Estrella
                </a>
              </li>
              <li>
                <a href="#carta-completa" className="hover:text-[#8F9E4B] transition-colors">
                  Carta Completa
                </a>
              </li>
              <li>
                <a href="#por-que-vacio" className="hover:text-[#8F9E4B] transition-colors">
                  Por qué al Vacío
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-[#FFFDF2]/40 hover:text-[#8F9E4B] transition-colors">
                  Acceso Administración
                </Link>
              </li>
            </ul>
          </div>

          {/* Location & Hours Column (4 cols) */}
          <div className="md:col-span-4">
            <h4 className="font-heading font-black text-xs uppercase tracking-widest text-[#8F9E4B] mb-4">
              Cocina & Retiro
            </h4>
            <div className="space-y-3 font-sans text-xs text-[#FFFDF2]/80">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#8F9E4B] shrink-0 mt-0.5" />
                <span>{store.address}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock size={16} className="text-[#8F9E4B] shrink-0 mt-0.5" />
                <span>{store.hours}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone size={16} className="text-[#8F9E4B] shrink-0 mt-0.5" />
                <span>+{store.whatsapp} (Atención y pedidos)</span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-[#FFFDF2]/5 border border-[#FFFDF2]/10 text-[11px] text-[#FFFDF2]/70">
              <strong className="text-[#FFFDF2] block font-heading text-xs">Pautas de conservación:</strong>
              Heladera (0-4°C): hasta 7 días. Freezer (-18°C): hasta 90 días.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFFDF2]/50 font-sans">
          <p>© {new Date().getFullYear()} abrí y serví. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con amor casero para Mar del Plata
          </p>
        </div>
      </div>
    </footer>
  );
}
