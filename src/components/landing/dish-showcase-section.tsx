"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PackagingSticker } from "@/components/brand/packaging-sticker";
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
      className="w-full py-20 sm:py-28 bg-[#FFFDF2] border-t border-[#DFD8C4] relative overflow-hidden"
    >
      {/* Decorative background typography watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] whitespace-nowrap font-heading font-black text-[18vw] text-[#222421]">
        {currentDish.name.split(" ")[0]}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8F9E4B]/15 text-[#668032] text-xs font-heading font-bold uppercase tracking-wider mb-3">
              <Sparkles size={13} />
              <span>Platos de Autor en Porción Individual</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-5xl text-[#222421] uppercase tracking-tight leading-tight">
              Los Platos Estrella
            </h2>
            <p className="font-sans text-base sm:text-lg text-[#5E4B3C] font-normal mt-2">
              Cada plato se cocina por separado respetando sus tiempos exactos de cocción,
              se sella con atmósfera modificada y viaja protegido con su sticker de autenticidad.
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
                className="w-11 h-11 rounded-full bg-[#FFFFFF] border border-[#DFD8C4] flex items-center justify-center text-[#222421] hover:bg-[#8F9E4B] hover:text-[#FFFDF2] hover:border-[#8F9E4B] transition-all shadow-xs"
                aria-label="Plato anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextDish}
                type="button"
                className="w-11 h-11 rounded-full bg-[#FFFFFF] border border-[#DFD8C4] flex items-center justify-center text-[#222421] hover:bg-[#8F9E4B] hover:text-[#FFFDF2] hover:border-[#8F9E4B] transition-all shadow-xs"
                aria-label="Plato siguiente"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Dish Selector Thumbnails Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {featuredDishes.map((dish, idx) => (
            <button
              key={dish.id}
              onClick={() => setSelectedIndex(idx)}
              className={`px-4 py-2.5 rounded-full font-heading text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border ${
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
          {/* Left Column: Visual Packaging & Food Presentation (7 cols) */}
          <div className="lg:col-span-7 bg-[#F7F4E6] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden min-h-[460px]">
            {/* Top Badge */}
            <div className="flex items-center justify-between z-10 mb-6">
              <span className="px-3 py-1 rounded-full bg-[#8F9E4B] text-[#FFFDF2] text-xs font-heading font-extrabold uppercase tracking-widest shadow-xs">
                {currentDish.tag || "100% CASERO"}
              </span>
              <span className="text-xs font-heading font-semibold text-[#5E4B3C] uppercase tracking-wider">
                Sticker de Packaging Real
              </span>
            </div>

            {/* Visual Center: Interactive Packaging Sticker & Food Photo side-by-side / overlay */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 my-auto py-4">
              {/* Dish Photo with Plate styling */}
              {currentDish.image && (
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden shadow-2xl border-4 border-[#FFFFFF] shrink-0 group">
                  <Image
                    src={currentDish.image}
                    alt={currentDish.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 224px, 256px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#222421]/40 via-transparent to-transparent pointer-events-none" />
                </div>
              )}

              {/* The Official Interactive Packaging Sticker */}
              <div className="flex flex-col items-center">
                <PackagingSticker
                  dish={currentDish}
                  size={260}
                  interactive={true}
                  className="shadow-2xl hover:scale-105 transition-transform duration-300"
                />
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#5E4B3C] mt-3 font-heading opacity-75">
                  ✦ Pasá el mouse para inclinar ✦
                </span>
              </div>
            </div>

            {/* Video preview pill if available */}
            {currentDish.video && (
              <div className="relative z-10 mt-6 inline-flex items-center gap-2 text-xs font-heading font-bold text-[#668032] bg-[#FFFFFF]/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#DFD8C4] self-start shadow-2xs">
                <Flame size={14} className="text-[#8F9E4B]" />
                <span>Video de preparación en agua disponible</span>
              </div>
            )}
          </div>

          {/* Right Column: Culinary Details & Instant Order (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-[#FFFFFF]">
            <div>
              {/* Category & Status */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#8F9E4B]">
                  Porción Envasada al Vacío
                </span>
              </div>

              {/* Main Dish Name */}
              <h3 className="font-heading font-black text-2xl sm:text-4xl text-[#222421] uppercase tracking-tight leading-tight mb-4">
                {currentDish.name}
              </h3>

              {/* Highlight / Storytelling */}
              {currentDish.highlight && (
                <div className="p-4 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] mb-4">
                  <p className="font-heading font-bold text-xs uppercase tracking-wider text-[#5E4B3C] mb-1">
                    El Secreto del Cocinero:
                  </p>
                  <p className="font-sans text-sm text-[#222421]/90 italic">
                    &ldquo;{currentDish.highlight}&rdquo;
                  </p>
                </div>
              )}

              {/* Full Description */}
              <p className="font-sans text-sm sm:text-base text-[#222421]/80 leading-relaxed mb-6">
                {currentDish.description}
              </p>

              {/* Technical Specifications Passport */}
              <div className="grid grid-cols-2 gap-3 mb-8 pt-4 border-t border-[#DFD8C4]/60">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4]/60">
                  <Clock size={18} className="text-[#8F9E4B] shrink-0" />
                  <div className="leading-tight">
                    <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block">
                      Tiempo Olla
                    </span>
                    <span className="text-xs font-bold text-[#222421] font-heading">
                      {currentDish.regenTime || "8-10 min"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4]/60">
                  <Scale size={18} className="text-[#8F9E4B] shrink-0" />
                  <div className="leading-tight">
                    <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block">
                      Peso Neto
                    </span>
                    <span className="text-xs font-bold text-[#222421] font-heading">
                      {currentDish.weight || "450g"}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4]/60">
                  <ShieldCheck size={18} className="text-[#668032] shrink-0" />
                  <div className="leading-tight">
                    <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block">
                      Método recomendado
                    </span>
                    <span className="text-xs font-semibold text-[#222421] font-sans">
                      {currentDish.method || "Herví la bolsa sin abrir en agua a 100°C"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Pricing & Order Action Bar */}
            <div className="pt-6 border-t border-[#DFD8C4]">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-[11px] uppercase font-bold text-[#5E4B3C] font-heading block">
                    Precio por porción
                  </span>
                  <span className="font-heading font-black text-3xl sm:text-4xl text-[#222421]">
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
                    <Minus size={14} />
                  </button>
                  <span className="w-9 text-center font-heading font-black text-sm text-[#222421]">
                    {currentQty}
                  </span>
                  <button
                    onClick={() => handleQtyChange(1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#222421] hover:bg-[#FFFFFF] active:scale-95 transition-all"
                    aria-label="Sumar una porción"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAdd}
                type="button"
                className="w-full py-4 rounded-full bg-[#8F9E4B] text-[#FFFDF2] font-heading font-black text-sm uppercase tracking-wider hover:bg-[#7D8B3F] active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 mb-2"
              >
                <ShoppingBag size={18} />
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
                className="w-full py-2.5 rounded-full text-center text-xs font-heading font-bold uppercase tracking-wider text-[#5E4B3C] hover:text-[#222421] hover:bg-[#FFFDF2] transition-colors flex items-center justify-center gap-1.5"
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
