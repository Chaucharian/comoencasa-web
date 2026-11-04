"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingBag, MessageCircle } from "lucide-react";

interface HeaderNavProps {
  cartCount: number;
  hasActiveOrder?: boolean;
  onOpenCart: () => void;
  whatsappNumber: string;
}

export function HeaderNav({
  cartCount,
  hasActiveOrder = false,
  onOpenCart,
  whatsappNumber,
}: HeaderNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const targetSection = document.getElementById("carta-completa") || document.getElementById("menu");
      if (targetSection) {
        const rect = targetSection.getBoundingClientRect();
        // Show header only once carta-completa section begins entering the top of screen
        setScrolled(rect.top <= 100);
      } else {
        setScrolled(window.scrollY > window.innerHeight * 2);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled
          ? "translate-y-0 opacity-100 bg-[#FFFDF2]/95 backdrop-blur-md shadow-sm py-2 sm:py-2.5 border-b border-[#8F9E4B]/15 text-[#222421]"
          : "-translate-y-full opacity-0 pointer-events-none py-2"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="group flex items-center select-none py-0.5"
          title="abrí y serví — Inicio"
        >
          <Image
            src="/brand/logo-olive.png"
            alt="abrí y serví"
            width={120}
            height={96}
            priority
            className="h-9 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </a>

        {/* Center navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-heading text-xs font-semibold tracking-wider text-[#222421]/80">
          <a
            href="#metodo"
            className="hover:text-[#8F9E4B] transition-colors uppercase py-1"
          >
            El Método (8 min)
          </a>
          <a
            href="#carta-completa"
            className="hover:text-[#8F9E4B] transition-colors uppercase py-1"
          >
            Platos al Vacío
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
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#8F9E4B]/30 text-[#222421] text-xs font-semibold hover:bg-[#8F9E4B]/10 transition-colors font-heading"
          >
            <MessageCircle size={14} className="text-[#668032]" />
            <span>Consultas</span>
          </a>

          {/* Cart Trigger Button */}
          <button
            onClick={onOpenCart}
            type="button"
            className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#68A01E] text-[#FFFDF2] font-heading text-xs font-bold tracking-wider uppercase shadow-md hover:bg-[#598B17] active:scale-95 transition-all cursor-pointer"
            aria-label="Ver pedido"
          >
            <ShoppingBag size={16} />
            <span className="hidden xs:inline">{hasActiveOrder && cartCount === 0 ? "Tu Pedido" : "Mi Pedido"}</span>
            {hasActiveOrder && cartCount === 0 && (
              <span className="size-2 rounded-full bg-white animate-ping" />
            )}
            {cartCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFFDF2] text-[#68A01E] text-[11px] font-black shadow-inner">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
