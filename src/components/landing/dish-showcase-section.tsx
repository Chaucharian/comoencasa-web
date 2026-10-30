"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SparkleStar } from "@/components/brand/brand-icons";
import {
  Flame,
  Clock,
  Scale,
  Sparkles,
  Plus,
  Minus,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  ExternalLink,
  Snowflake,
} from "lucide-react";
import type { Dish } from "@/lib/types";

interface DishShowcaseProps {
  featuredDishes: Dish[];
  onAddToCart: (dish: Dish, qty: number) => void;
  onOpenCart: () => void;
  whatsappNumber: string;
}

export function DishShowcaseSection({
  featuredDishes,
  onAddToCart,
  onOpenCart,
  whatsappNumber,
}: DishShowcaseProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const currentDish = featuredDishes[selectedIndex] || featuredDishes[0];

  if (!currentDish) return null;

  const currentQty = quantities[currentDish.id] || 1;

  const handleQtyChange = (delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(1, (prev[currentDish.id] || 1) + delta);
      return { ...prev, [currentDish.id]: next };
    });
  };

  const handleAdd = () => {
    onAddToCart(currentDish, currentQty);
    setAddedToast(currentDish.name);
    setTimeout(() => setAddedToast(null), 2500);
  };

  const nextDish = () => {
    setSelectedIndex((prev) => (prev + 1) % featuredDishes.length);
  };

  const prevDish = () => {
    setSelectedIndex((prev) => (prev - 1 + featuredDishes.length) % featuredDishes.length);
  };

  return (
    <section
      id="platos-estrella"
      className="w-full py-16 sm:py-24 bg-[#FFFDF2] border-t border-[#DFD8C4] relative overflow-hidden"
    >
      {/* Decorative background watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.025] whitespace-nowrap font-heading font-black text-[18vw] text-[#222421]">
        {currentDish.name.split(" ")[0]}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8F9E4B]/15 text-[#668032] text-xs font-heading font-bold uppercase tracking-wider mb-2.5">
              <Sparkles size={13} />
              <span>Platos de Autor envasados al vacío</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-4xl md:text-5xl text-[#222421] uppercase tracking-tight leading-tight">
              Los Platos Estrella
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#5E4B3C] font-normal mt-2">
              Cada plato se cocina por separado respetando sus tiempos exactos de cocción tradicional,
              se sella con atmósfera modificada y se regenera en tu casa en 8 a 10 minutos.
            </p>
          </div>

          {/* Dish Navigation Controls */}
          <div className="flex items-center gap-3">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#5E4B3C]">
              {selectedIndex + 1} / {featuredDishes.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevDish}
                type="button"
                className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#DFD8C4] flex items-center justify-center text-[#222421] hover:bg-[#8F9E4B] hover:text-[#FFFDF2] hover:border-[#8F9E4B] transition-all shadow-xs"
                aria-label="Plato anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextDish}
                type="button"
                className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#DFD8C4] flex items-center justify-center text-[#222421] hover:bg-[#8F9E4B] hover:text-[#FFFDF2] hover:border-[#8F9E4B] transition-all shadow-xs"
                aria-label="Plato siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Dish Selector Thumbnails Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          {featuredDishes.map((dish, idx) => (
            <button
              key={dish.id}
              onClick={() => setSelectedIndex(idx)}
              className={`px-4 py-2 rounded-full font-heading text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border ${
                selectedIndex === idx
                  ? "bg-[#222421] text-[#FFFDF2] border-[#222421] shadow-md scale-102"
                  : "bg-[#FFFFFF] text-[#222421]/80 border-[#DFD8C4] hover:border-[#8F9E4B] hover:bg-[#FFFDF2]"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedIndex === idx ? "bg-[#8F9E4B]" : "bg-[#DFD8C4]"
                }`}
              />
              <span>{dish.name}</span>
            </button>
          ))}
        </div>

        {/* Featured Dish Showcase Hero Card */}
        <div className="rounded-3xl bg-[#FFFFFF] border border-[#DFD8C4] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
          {/* Left Column: Food Photography Presentation (6 cols) */}
          <div className="lg:col-span-6 bg-[#F7F4E6] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden min-h-[380px] sm:min-h-[460px]">
            {/* Top Badges */}
            <div className="flex items-center justify-between z-10 mb-4">
              <span className="px-3 py-1 rounded-full bg-[#8F9E4B] text-[#FFFDF2] text-xs font-heading font-extrabold uppercase tracking-widest shadow-xs">
                {currentDish.tag || "100% CASERO"}
              </span>
              <span className="text-xs font-heading font-semibold text-[#5E4B3C] uppercase tracking-wider bg-[#FFFFFF]/75 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#DFD8C4]/60">
                Envasado al Vacío
              </span>
            </div>

            {/* Large Cinematic Food Photography */}
            <div className="relative z-10 w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-[#DFD8C4] my-auto group">
              {currentDish.image ? (
                <Image
                  src={currentDish.image}
                  alt={currentDish.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#F4EFE3] text-[#5E4B3C] font-heading font-bold uppercase">
                  abrí y serví
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#222421]/60 via-transparent to-transparent pointer-events-none" />

              {/* Bottom Badge inside photo */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="text-xs font-heading font-bold uppercase text-[#FFFDF2] bg-[#222421]/70 backdrop-blur-md px-3 py-1 rounded-full">
                  ⏱️ {currentDish.regenTime || "8-10 min"} en agua
                </span>
                <span className="text-xs font-heading font-bold uppercase text-[#FFFDF2] bg-[#8F9E4B] px-3 py-1 rounded-full shadow-xs">
                  ⚖️ {currentDish.weight || "450g"}
                </span>
              </div>
            </div>

            {/* Video preview pill if available */}
            {currentDish.video && (
              <div className="relative z-10 mt-4 inline-flex items-center gap-2 text-xs font-heading font-bold text-[#668032] bg-[#FFFFFF]/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#DFD8C4] self-start shadow-2xs">
                <Flame size={14} className="text-[#8F9E4B]" />
                <span>Video de preparación al baño maría disponible</span>
              </div>
            )}
          </div>

          {/* Right Column: Culinary Details & Instant Order (6 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between bg-[#FFFFFF]">
            <div>
              {/* Category */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#8F9E4B]">
                  Listo para regenerar en 8 min
                </span>
              </div>

              {/* Main Dish Name */}
              <h3 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-[#222421] uppercase tracking-tight leading-tight mb-3">
                {currentDish.name}
              </h3>

              {/* Highlight / Storytelling */}
              {currentDish.highlight && (
                <div className="p-4 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] mb-4">
                  <p className="font-heading font-bold text-xs uppercase tracking-wider text-[#5E4B3C] mb-1">
                    El Secreto del Cocinero:
                  </p>
                  <p className="font-sans text-xs sm:text-sm text-[#222421]/90 italic leading-relaxed">
                    &ldquo;{currentDish.highlight}&rdquo;
                  </p>
                </div>
              )}

              {/* Full Description */}
              <p className="font-sans text-xs sm:text-sm text-[#222421]/80 leading-relaxed mb-6">
                {currentDish.description}
              </p>

              {/* Technical Specifications Passport */}
              <div className="grid grid-cols-2 gap-2.5 mb-6 pt-4 border-t border-[#DFD8C4]/60">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4]/60">
                  <Clock size={16} className="text-[#8F9E4B] shrink-0" />
                  <div className="leading-tight">
                    <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block">
                      Tiempo Olla
                    </span>
                    <span className="text-xs font-bold text-[#222421] font-heading">
                      {currentDish.regenTime || "8-10 min"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4]/60">
                  <Scale size={16} className="text-[#8F9E4B] shrink-0" />
                  <div className="leading-tight">
                    <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block">
                      Peso Porción
                    </span>
                    <span className="text-xs font-bold text-[#222421] font-heading">
                      {currentDish.weight || "450g"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4]/60">
                  <Snowflake size={16} className="text-[#5E4B3C] shrink-0" />
                  <div className="leading-tight">
                    <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block">
                      Conservación
                    </span>
                    <span className="text-xs font-semibold text-[#222421] font-sans">
                      7 días frío / 3 meses freezer
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4]/60">
                  <ShieldCheck size={16} className="text-[#668032] shrink-0" />
                  <div className="leading-tight">
                    <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block">
                      Garantía
                    </span>
                    <span className="text-xs font-semibold text-[#222421] font-sans">
                      0% Conservantes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Pricing & Order Action Bar */}
            <div className="pt-5 border-t border-[#DFD8C4]">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block">
                    Precio por porción
                  </span>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-[#222421]">
                    ${currentDish.price.toLocaleString("es-AR")}
                  </span>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center border border-[#DFD8C4] rounded-full p-1 bg-[#FFFDF2]">
                  <button
                    onClick={() => handleQtyChange(-1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#222421] hover:bg-[#FFFFFF] active:scale-95 transition-all"
                    aria-label="Restar una porción"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-8 text-center font-heading font-black text-sm text-[#222421]">
                    {currentQty}
                  </span>
                  <button
                    onClick={() => handleQtyChange(1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#222421] hover:bg-[#FFFFFF] active:scale-95 transition-all"
                    aria-label="Sumar una porción"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAdd}
                type="button"
                className="w-full py-3.5 sm:py-4 rounded-full bg-[#8F9E4B] text-[#FFFDF2] font-heading font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#7D8B3F] active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 mb-2"
              >
                <ShoppingBag size={17} />
                <span>
                  Agregar {currentQty} al pedido • ${(currentDish.price * currentQty).toLocaleString("es-AR")}
                </span>
              </button>

              {/* Quick direct WhatsApp link */}
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  `¡Hola! Quiero pedir ${currentQty}x ${currentDish.name} ($${(currentDish.price * currentQty).toLocaleString("es-AR")}) de abrí y serví.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-full text-center text-xs font-heading font-bold uppercase tracking-wider text-[#5E4B3C] hover:text-[#222421] hover:bg-[#FFFDF2] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Pedir directo por WhatsApp</span>
                <ExternalLink size={12} />
              </a>

              {/* Added Toast Alert */}
              {addedToast && (
                <div className="mt-2 text-center text-xs font-heading font-bold text-[#668032] flex items-center justify-center gap-1.5 animate-bounce">
                  <Check size={14} />
                  <span>¡{addedToast} agregado al pedido!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
