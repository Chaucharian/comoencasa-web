"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Sparkles,
  Plus,
  Minus,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
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

const CATEGORIES = [
  { id: "todos", label: "Todos" },
  { id: "carnes", label: "Carnes" },
  { id: "pollos", label: "Pollos" },
  { id: "pastas", label: "Pastas" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

export function DishShowcaseSection({
  featuredDishes,
  onAddToCart,
  whatsappNumber,
}: DishShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("todos");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const getDishCategory = (dish: Dish): "carnes" | "pollos" | "pastas" => {
    const name = dish.name.toLowerCase();
    const desc = (dish.description || "").toLowerCase();
    const cat = (dish.categoryId || "").toLowerCase();

    if (
      name.includes("pollo") ||
      name.includes("pechuga") ||
      desc.includes("pollo") ||
      desc.includes("pechuga")
    ) {
      return "pollos";
    }

    if (
      name.includes("pasta") ||
      name.includes("raviol") ||
      name.includes("sorrentin") ||
      name.includes("ñoqui") ||
      cat.includes("horno") ||
      cat.includes("pasta")
    ) {
      return "pastas";
    }

    return "carnes";
  };

  const filteredDishes = useMemo(() => {
    if (activeCategory === "todos") return featuredDishes;
    return featuredDishes.filter((d) => getDishCategory(d) === activeCategory);
  }, [featuredDishes, activeCategory]);

  const currentDish = filteredDishes[selectedIndex] || filteredDishes[0] || featuredDishes[0];

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
    if (filteredDishes.length <= 1) return;
    setSelectedIndex((prev) => (prev + 1) % filteredDishes.length);
  };

  const prevDish = () => {
    if (filteredDishes.length <= 1) return;
    setSelectedIndex((prev) => (prev - 1 + filteredDishes.length) % filteredDishes.length);
  };

  return (
    <section
      id="platos-estrella"
      className="w-full py-16 sm:py-24 bg-[#FFFDF2] border-t border-[#DFD8C4] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8F9E4B]/15 text-[#668032] text-xs font-heading font-bold uppercase tracking-wider mb-2.5">
            <Sparkles size={13} />
            <span>Comida casera envasada al vacío</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl md:text-5xl text-[#222421] uppercase tracking-tight leading-tight">
            Los Platos Estrella
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#5E4B3C] font-normal mt-2">
            Regenerados en baño maría en 8 a 10 minutos. Sin conservantes, listos para servir.
          </p>
        </div>

        {/* Subtle Category Filter Bar & Navigation */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          {/* Categories: Todos, Carnes, Pollos, Pastas */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#F4EFE3] border border-[#DFD8C4] gap-1">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSelectedIndex(0);
                  }}
                  className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-heading text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#222421] text-[#FFFDF2] shadow-sm"
                      : "text-[#5E4B3C] hover:text-[#222421] hover:bg-[#FFFFFF]/60"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Dish Counter & Arrows */}
          <div className="flex items-center gap-3">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#5E4B3C]">
              {selectedIndex + 1} / {filteredDishes.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevDish}
                type="button"
                className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#DFD8C4] flex items-center justify-center text-[#222421] hover:bg-[#8F9E4B] hover:text-[#FFFDF2] hover:border-[#8F9E4B] active:scale-95 transition-all shadow-2xs cursor-pointer"
                aria-label="Plato anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextDish}
                type="button"
                className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#DFD8C4] flex items-center justify-center text-[#222421] hover:bg-[#8F9E4B] hover:text-[#FFFDF2] hover:border-[#8F9E4B] active:scale-95 transition-all shadow-2xs cursor-pointer"
                aria-label="Plato siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Simplified & Elegant Dish Card */}
        <div className="rounded-3xl bg-[#FFFFFF] border border-[#DFD8C4] shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Food Photography (5 cols) */}
          <div className="lg:col-span-5 relative bg-[#F7F4E6] min-h-[280px] sm:min-h-[360px] lg:min-h-[440px] overflow-hidden group">
            {currentDish.image ? (
              <Image
                src={currentDish.image}
                alt={currentDish.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 45vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#F4EFE3] text-[#5E4B3C] font-heading font-bold uppercase">
                abrí y serví
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#222421]/60 via-transparent to-transparent pointer-events-none" />

            {/* Quick Tag inside photo */}
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 rounded-full bg-[#8F9E4B] text-[#FFFDF2] text-[11px] font-heading font-extrabold uppercase tracking-wider shadow-sm">
                {currentDish.tag || "100% CASERO"}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="text-[11px] font-heading font-bold uppercase text-[#FFFDF2] bg-[#222421]/75 backdrop-blur-md px-3 py-1 rounded-full">
                ⏱️ {currentDish.regenTime || "8-10 min"} en olla
              </span>
              <span className="text-[11px] font-heading font-bold uppercase text-[#FFFDF2] bg-[#222421]/75 backdrop-blur-md px-3 py-1 rounded-full">
                ⚖️ {currentDish.weight || "450g"}
              </span>
            </div>
          </div>

          {/* Right Column: Culinary Details & Instant Order (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between bg-[#FFFFFF]">
            <div>
              {/* Category Subtitle */}
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="text-xs font-heading font-bold uppercase tracking-widest text-[#8F9E4B]">
                  • Envasado al Vacío · Listo en 8 min
                </span>
              </div>

              {/* Main Dish Name */}
              <h3 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#222421] uppercase tracking-tight leading-tight mb-3">
                {currentDish.name}
              </h3>

              {/* Clean Single Culinary Description */}
              <p className="font-sans text-sm sm:text-base text-[#5E4B3C] leading-relaxed mb-6 font-normal">
                {currentDish.description}
              </p>

              {/* Simplified 3-Item Specs Bar */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 py-3.5 mb-6 border-y border-[#DFD8C4]/60 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#8F9E4B]">
                    Tiempo
                  </span>
                  <span className="text-xs sm:text-sm font-heading font-extrabold text-[#222421] mt-0.5">
                    {currentDish.regenTime || "8-10 min"}
                  </span>
                </div>

                <div className="flex flex-col items-center border-x border-[#DFD8C4]/60">
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#8F9E4B]">
                    Porción
                  </span>
                  <span className="text-xs sm:text-sm font-heading font-extrabold text-[#222421] mt-0.5">
                    {currentDish.weight || "450g"}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#8F9E4B]">
                    Conservación
                  </span>
                  <span className="text-xs sm:text-sm font-heading font-extrabold text-[#222421] mt-0.5">
                    7d frío / 3m freezer
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Pricing & Order Action Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between gap-4 mb-4">
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
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#222421] hover:bg-[#FFFFFF] active:scale-95 transition-all cursor-pointer"
                    aria-label="Restar una porción"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-heading font-black text-sm text-[#222421]">
                    {currentQty}
                  </span>
                  <button
                    onClick={() => handleQtyChange(1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#222421] hover:bg-[#FFFFFF] active:scale-95 transition-all cursor-pointer"
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
                className="w-full py-3.5 sm:py-4 rounded-full bg-[#68A01E] text-[#FFFDF2] font-heading font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#598B17] active:scale-98 transition-all shadow-md shadow-[#68A01E]/30 flex items-center justify-center gap-2 cursor-pointer mb-2"
              >
                <ShoppingBag size={17} />
                <span>
                  AGREGAR AL PEDIDO • ${(currentDish.price * currentQty).toLocaleString("es-AR")}
                </span>
              </button>

              {/* Direct WhatsApp link */}
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
