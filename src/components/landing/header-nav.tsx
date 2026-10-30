"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { BrandIsotypeSvg, SparkleStar } from "@/components/brand/brand-icons";

interface HeaderNavProps {
  cartCount: number;
  onOpenCart: () => void;
  whatsappNumber: string;
}

export function HeaderNav({
  cartCount,
  onOpenCart,
  whatsappNumber,
}: HeaderNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[#FFFDF2]/95 backdrop-blur-md shadow-sm py-2.5 border-b border-[#8F9E4B]/15 text-[#222421]"
          : "bg-[#222421]/65 backdrop-blur-md border-b border-[#FFFDF2]/15 py-3 sm:py-4 shadow-md text-[#FFFDF2]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Horizontal Brand Identity */}
        <a
          href="#"
          className="group flex items-center gap-3 select-none"
          title="abrí y serví — Inicio"
        >
          {/* Circular badge container for Isotype */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#8F9E4B] flex items-center justify-center text-[#FFFDF2] shadow-md group-hover:scale-105 transition-transform shrink-0 border-2 border-[#FFFDF2]">
            <BrandIsotypeSvg size={26} className="text-[#FFFDF2]" />
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span
                className={`font-script text-2xl transition-colors ${
                  scrolled
                    ? "text-[#222421] group-hover:text-[#8F9E4B]"
                    : "text-[#FFFDF2] group-hover:text-[#8F9E4B]"
                }`}
              >
                abrí
              </span>
              <span className="font-script text-base text-[#8F9E4B]">&</span>
              <span
                className={`font-script text-2xl transition-colors ${
                  scrolled
                    ? "text-[#222421] group-hover:text-[#8F9E4B]"
                    : "text-[#FFFDF2] group-hover:text-[#8F9E4B]"
                }`}
              >
                serví
              </span>
              <SparkleStar size={11} className="text-[#8F9E4B] ml-0.5 animate-pulse" />
            </div>
            <span
              className={`text-[9.5px] uppercase font-bold tracking-wider font-heading mt-0.5 transition-colors ${
                scrolled ? "text-[#5E4B3C]" : "text-[#FFFDF2]/80"
              }`}
            >
              Comida casera al vacío
            </span>
          </div>
        </a>

        {/* Center navigation links */}
        <nav
          className={`hidden md:flex items-center gap-6 lg:gap-8 font-heading text-xs font-semibold tracking-wider transition-colors ${
            scrolled ? "text-[#222421]/80" : "text-[#FFFDF2]/90"
          }`}
        >
          <a
            href="#metodo"
            className="hover:text-[#8F9E4B] transition-colors uppercase py-1"
          >
            El Método (8 min)
          </a>
          <a
            href="#platos-estrella"
            className="hover:text-[#8F9E4B] transition-colors uppercase py-1"
          >
            Platos Estrella
          </a>
          <a
            href="#carta-completa"
            className="hover:text-[#8F9E4B] transition-colors uppercase py-1"
          >
            Toda la Carta
          </a>
          <a
            href="#por-que-vacio"
            className="hover:text-[#8F9E4B] transition-colors uppercase py-1"
          >
            Ventajas del Vacío
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick WhatsApp Link */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              "¡Hola! Quiero consultar por los platos envasados al vacío de abrí y serví."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-semibold transition-colors font-heading ${
              scrolled
                ? "border-[#8F9E4B]/30 text-[#222421] hover:bg-[#8F9E4B]/10"
                : "border-[#FFFDF2]/30 text-[#FFFDF2] hover:bg-[#FFFDF2]/15"
            }`}
          >
            <MessageCircle size={14} className={scrolled ? "text-[#668032]" : "text-[#8F9E4B]"} />
            <span>Consultas</span>
          </a>

          {/* Cart Trigger Button */}
          <button
            onClick={onOpenCart}
            type="button"
            className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#8F9E4B] text-[#FFFDF2] font-heading text-xs font-bold tracking-wider uppercase shadow-md hover:bg-[#7D8B3F] active:scale-95 transition-all"
            aria-label="Ver pedido"
          >
            <ShoppingBag size={16} />
            <span className="hidden xs:inline">Mi Pedido</span>
            {cartCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFFDF2] text-[#8F9E4B] text-[11px] font-black shadow-inner">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
