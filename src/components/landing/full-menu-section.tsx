"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Clock,
  Scale,
  Sparkles,
  ShoppingBag,
  X,
  Check,
  ShieldCheck,
  Flame,
  Activity,
  ChevronDown,
} from "lucide-react";
import { getDishNutrition } from "@/lib/menu";
import type { Category, Dish } from "@/lib/types";

interface FullMenuSectionProps {
  categories: Category[];
  dishes: Dish[];
  onAddToCart: (dish: Dish, qty: number) => void;
  whatsappNumber: string;
}

export function FullMenuSection({
  categories,
  dishes,
  onAddToCart,
  whatsappNumber,
}: FullMenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectedDish, setInspectedDish] = useState<Dish | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [showAllNutrition, setShowAllNutrition] = useState(false);

  const toggleNutrition = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAllNutrition((prev) => !prev);
  };

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesCategory =
        selectedCategory === "all" || dish.categoryId === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [dishes, selectedCategory, searchQuery]);

  const handleQuickAdd = (dish: Dish, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(dish, 1);
    setRecentlyAddedId(dish.id);
    setTimeout(() => setRecentlyAddedId(null), 1800);
  };

  return (
    <section
      id="carta-completa"
      className="w-full py-20 sm:py-28 bg-[#FFFDF2] border-t border-[#DFD8C4] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8F9E4B]/15 text-[#668032] text-xs font-heading font-bold uppercase tracking-wider mb-3">
            <ShoppingBag size={13} />
            <span>Toda la Carta Disponible</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-[#222421] uppercase tracking-tight">
            Explorá el Menú Completo
          </h2>
          <p className="font-sans text-base sm:text-lg text-[#5E4B3C] font-normal mt-3">
            Elegí tus porciones individuales o familiares para la semana. Armá tu pedido
            y recibilo en Mar del Plata o retiralo cuando gustes.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full font-heading text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                selectedCategory === "all"
                  ? "bg-[#8F9E4B] text-[#FFFDF2] border-[#8F9E4B] shadow-sm"
                  : "bg-[#FFFFFF] text-[#222421] border-[#DFD8C4] hover:border-[#8F9E4B]"
              }`}
            >
              Todos ({dishes.length})
            </button>
            {categories.map((cat) => {
              const count = dishes.filter((d) => d.categoryId === cat.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full font-heading text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                    selectedCategory === cat.id
                      ? "bg-[#8F9E4B] text-[#FFFDF2] border-[#8F9E4B] shadow-sm"
                      : "bg-[#FFFFFF] text-[#222421] border-[#DFD8C4] hover:border-[#8F9E4B]"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Controls: Nutrition Toggle & Search Box */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setShowAllNutrition((prev) => !prev)}
              className={`px-3.5 py-2 rounded-full text-xs font-heading font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border shrink-0 cursor-pointer ${
                showAllNutrition
                  ? "bg-[#68A01E] text-[#FFFDF2] border-[#68A01E] shadow-sm"
                  : "bg-[#FFFFFF] text-[#5E4B3C] border-[#DFD8C4] hover:border-[#68A01E] hover:text-[#222421]"
              }`}
              title="Mostrar u ocultar información nutricional en todos los platos"
            >
              <Activity size={14} className={showAllNutrition ? "text-[#FFFDF2]" : "text-[#68A01E]"} />
              <span className="hidden xs:inline">
                {showAllNutrition ? "Ocultar Macros" : "Ver Macros en Todos"}
              </span>
              <span className="xs:hidden">Macros</span>
            </button>

            {/* Search Box */}
            <div className="relative flex-1 md:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E4B3C]"
              />
              <input
                type="text"
                placeholder="Buscar plato o ingrediente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#FFFFFF] border border-[#DFD8C4] text-xs font-sans text-[#222421] placeholder:text-[#5E4B3C]/60 focus:outline-none focus:border-[#68A01E] focus:ring-1 focus:ring-[#68A01E]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5E4B3C] hover:text-[#222421]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dishes Grid */}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#DFD8C4] p-8">
            <p className="font-heading font-bold text-lg text-[#222421] uppercase">
              No encontramos platos con esa búsqueda
            </p>
            <p className="font-sans text-sm text-[#5E4B3C] mt-1">
              Probá limpiando el buscador o eligiendo otra categoría.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                onClick={() => setInspectedDish(dish)}
                className="group rounded-2xl bg-[#FFFFFF] border border-[#DFD8C4] hover:border-[#8F9E4B] hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                {/* Dish Card Image Header */}
                <div className="relative h-48 w-full bg-[#F4EFE3] overflow-hidden">
                  {dish.image ? (
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#5E4B3C]/50 font-heading text-xs font-bold uppercase">
                      abrí y serví
                    </div>
                  )}

                  {/* Badges on top */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    {dish.tag && (
                      <span className="px-2 py-0.5 rounded bg-[#8F9E4B] text-[#FFFDF2] text-[10px] font-heading font-black uppercase tracking-wider shadow-xs">
                        {dish.tag}
                      </span>
                    )}
                    {dish.regenTime && (
                      <span className="px-2 py-0.5 rounded bg-[#222421]/75 backdrop-blur-xs text-[#FFFDF2] text-[10px] font-heading font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock size={10} />
                        <span>{dish.regenTime}</span>
                      </span>
                    )}
                  </div>

                  {dish.weight && (
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-[#FFFFFF]/90 backdrop-blur-xs text-[#222421] text-[10px] font-heading font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                      <Scale size={10} />
                      <span>{dish.weight}</span>
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-lg text-[#222421] uppercase tracking-wide group-hover:text-[#8F9E4B] transition-colors leading-snug line-clamp-2">
                      {dish.name}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#222421]/70 mt-2 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>

                    {/* Collapsible Nutritional Information (Synced across all cards) */}
                    {(() => {
                      const nutri = getDishNutrition(dish);
                      const isExpanded = showAllNutrition;
                      return (
                        <div
                          className="mt-3 pt-2.5 border-t border-[#DFD8C4]/50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={toggleNutrition}
                            className="w-full flex items-center justify-between text-left text-[11px] font-heading font-bold text-[#5E4B3C] hover:text-[#68A01E] transition-colors py-0.5 group/nutri cursor-pointer"
                            aria-expanded={isExpanded}
                            title="Ver u ocultar información nutricional en todos los platos"
                          >
                            <span className="flex items-center gap-1.5">
                              <Activity
                                size={13}
                                className="text-[#68A01E] group-hover/nutri:scale-110 transition-transform"
                              />
                              <span className="tracking-wide">Info Nutricional</span>
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-[#68A01E] font-bold">
                              <span>{isExpanded ? "Ocultar" : "Ver macros"}</span>
                              <ChevronDown
                                size={12}
                                className={`transition-transform duration-250 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </span>
                          </button>

                          {/* Smooth Collapsible Content */}
                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              isExpanded
                                ? "grid-rows-[1fr] opacity-100 mt-2"
                                : "grid-rows-[0fr] opacity-0 pointer-events-none"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="p-2.5 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] text-[11px]">
                                <div className="grid grid-cols-4 gap-1.5 text-center">
                                  <div className="p-1.5 rounded-lg bg-white border border-[#DFD8C4]/40 shadow-2xs">
                                    <span className="block text-[8px] uppercase font-bold text-[#5E4B3C]/80 tracking-tight">
                                      Calorías
                                    </span>
                                    <span className="font-heading font-black text-[#222421] text-xs">
                                      {nutri.calories}
                                    </span>
                                    <span className="text-[8px] text-[#5E4B3C]/70 block font-medium">
                                      kcal
                                    </span>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-[#8F9E4B]/10 border border-[#8F9E4B]/30 shadow-2xs">
                                    <span className="block text-[8px] uppercase font-bold text-[#668032] tracking-tight">
                                      Proteína
                                    </span>
                                    <span className="font-heading font-black text-[#668032] text-xs">
                                      {nutri.proteins}g
                                    </span>
                                    <span className="text-[8px] text-[#668032]/80 block font-bold">
                                      alta
                                    </span>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-white border border-[#DFD8C4]/40 shadow-2xs">
                                    <span className="block text-[8px] uppercase font-bold text-[#5E4B3C]/80 tracking-tight">
                                      Carbos
                                    </span>
                                    <span className="font-heading font-black text-[#222421] text-xs">
                                      {nutri.carbs}g
                                    </span>
                                    <span className="text-[8px] text-[#5E4B3C]/70 block font-medium">
                                      energía
                                    </span>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-white border border-[#DFD8C4]/40 shadow-2xs">
                                    <span className="block text-[8px] uppercase font-bold text-[#5E4B3C]/80 tracking-tight">
                                      Grasas
                                    </span>
                                    <span className="font-heading font-black text-[#222421] text-xs">
                                      {nutri.fats}g
                                    </span>
                                    <span className="text-[8px] text-[#5E4B3C]/70 block font-medium">
                                      totales
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-[9px] text-[#5E4B3C]/80 pt-1.5 border-t border-[#DFD8C4]/60 px-0.5">
                                  <span>Porción: {dish.weight || "450g"}</span>
                                  {nutri.sodium && <span>Sodio: {nutri.sodium}mg</span>}
                                  <span className="font-bold text-[#668032]">100% natural</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Card Footer: Price & Add Button */}
                  <div className="mt-5 pt-4 border-t border-[#DFD8C4]/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block">
                        Porción
                      </span>
                      <span className="font-heading font-black text-xl text-[#222421]">
                        ${dish.price.toLocaleString("es-AR")}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(dish, e)}
                      type="button"
                      className={`px-4 py-2 rounded-full font-heading text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                        recentlyAddedId === dish.id
                          ? "bg-[#558316] text-[#FFFDF2] shadow-sm"
                          : "bg-[#68A01E] text-[#FFFDF2] hover:bg-[#598B17] shadow-md shadow-[#68A01E]/30 hover:scale-[1.03] active:scale-95"
                      }`}
                    >
                      {recentlyAddedId === dish.id ? (
                        <>
                          <Check size={14} className="stroke-[3]" />
                          <span>Listo</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} className="stroke-[3]" />
                          <span>AGREGAR</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dish Inspection Modal with Real Packaging Sticker Preview */}
      {inspectedDish && (
        <div
          onClick={() => setInspectedDish(null)}
          className="fixed inset-0 z-50 bg-[#222421]/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFFFF] rounded-3xl max-w-2xl w-full border border-[#DFD8C4] shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={() => setInspectedDish(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#FFFFFF]/90 hover:bg-[#DFD8C4] text-[#222421] flex items-center justify-center transition-colors shadow-xs"
              aria-label="Cerrar ventana"
            >
              <X size={18} />
            </button>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto">
              {/* Photo & Header */}
              {inspectedDish.image && (
                <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden mb-6 border border-[#DFD8C4] shadow-md">
                  <Image
                    src={inspectedDish.image}
                    alt={inspectedDish.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 600px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#222421]/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[#FFFDF2]">
                    <span className="text-xs font-heading font-bold uppercase bg-[#8F9E4B] px-3 py-1 rounded-full shadow-xs">
                      {inspectedDish.tag || "100% CASERO"}
                    </span>
                    {inspectedDish.weight && (
                      <span className="text-xs font-heading font-bold uppercase bg-[#222421]/80 backdrop-blur-xs px-2.5 py-1 rounded-full">
                        ⚖️ {inspectedDish.weight}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="text-left mb-4">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#8F9E4B] mb-1 block">
                  Porción Envasada al Vacío
                </span>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-[#222421] uppercase tracking-tight">
                  {inspectedDish.name}
                </h3>
              </div>

              {inspectedDish.highlight && (
                <div className="p-3.5 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] mb-4">
                  <p className="font-heading font-bold text-xs uppercase text-[#5E4B3C] mb-0.5">
                    Detalle del plato:
                  </p>
                  <p className="font-sans text-xs sm:text-sm text-[#222421]/90 italic">
                    &ldquo;{inspectedDish.highlight}&rdquo;
                  </p>
                </div>
              )}

              <p className="font-sans text-sm text-[#222421]/80 leading-relaxed mb-6">
                {inspectedDish.description}
              </p>

              {/* Passport Specs */}
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4]/60">
                  <Clock size={16} className="text-[#8F9E4B]" />
                  <div className="leading-tight">
                    <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block">
                      Regeneración
                    </span>
                    <span className="text-xs font-bold text-[#222421] font-heading">
                      {inspectedDish.regenTime || "8-10 min"} en agua
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4]/60">
                  <ShieldCheck size={16} className="text-[#668032]" />
                  <div className="leading-tight">
                    <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block">
                      Método
                    </span>
                    <span className="text-xs font-bold text-[#222421] font-heading truncate">
                      {inspectedDish.method || "Herví sin abrir"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nutritional Information in Modal */}
              {(() => {
                const nutri = getDishNutrition(inspectedDish);
                return (
                  <div className="mb-6 p-4 rounded-2xl bg-[#FFFDF2] border border-[#DFD8C4]">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="flex items-center gap-1.5 text-xs font-heading font-black uppercase tracking-wider text-[#222421]">
                        <Activity size={14} className="text-[#8F9E4B]" />
                        <span>Información Nutricional (por porción)</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#668032] uppercase">
                        100% natural · Sin conservantes
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-white border border-[#DFD8C4]/60">
                        <span className="block text-[9px] uppercase font-bold text-[#5E4B3C]/80">Calorías</span>
                        <span className="font-heading font-black text-sm sm:text-base text-[#222421]">{nutri.calories}</span>
                        <span className="text-[9px] text-[#5E4B3C]/70 block font-medium">kcal</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#8F9E4B]/15 border border-[#8F9E4B]/30">
                        <span className="block text-[9px] uppercase font-bold text-[#668032]">Proteína</span>
                        <span className="font-heading font-black text-sm sm:text-base text-[#668032]">{nutri.proteins}g</span>
                        <span className="text-[9px] text-[#668032]/80 block font-bold">alta</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#DFD8C4]/60">
                        <span className="block text-[9px] uppercase font-bold text-[#5E4B3C]/80">Carbos</span>
                        <span className="font-heading font-black text-sm sm:text-base text-[#222421]">{nutri.carbs}g</span>
                        <span className="text-[9px] text-[#5E4B3C]/70 block font-medium">energía</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#DFD8C4]/60">
                        <span className="block text-[9px] uppercase font-bold text-[#5E4B3C]/80">Grasas</span>
                        <span className="font-heading font-black text-sm sm:text-base text-[#222421]">{nutri.fats}g</span>
                        <span className="text-[9px] text-[#5E4B3C]/70 block font-medium">totales</span>
                      </div>
                    </div>

                    {nutri.sodium && (
                      <p className="mt-2 text-[10px] text-[#5E4B3C]/80 text-right">
                        Sodio: <strong className="text-[#222421]">{nutri.sodium}mg</strong> · Envasado al vacío hermético ({inspectedDish.weight || "450g"})
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Modal Add to Cart Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DFD8C4]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block">
                    Precio unitario
                  </span>
                  <span className="font-heading font-black text-2xl text-[#222421]">
                    ${inspectedDish.price.toLocaleString("es-AR")}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onAddToCart(inspectedDish, 1);
                    setInspectedDish(null);
                  }}
                  type="button"
                  className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#68A01E] text-[#FFFDF2] font-heading font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#598B17] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#68A01E]/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} className="stroke-[3]" />
                  <span>AGREGAR AL PEDIDO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
