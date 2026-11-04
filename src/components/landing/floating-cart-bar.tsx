"use client";

import React from "react";
import { ShoppingBag, ArrowRight, PackageCheck, Clock, Flame, Truck } from "lucide-react";
import type { CartLine, Order } from "@/lib/types";

interface FloatingCartBarProps {
  cart: CartLine[];
  activeOrder?: Order | null;
  onOpenCart: () => void;
  isOpen: boolean;
}

export function FloatingCartBar({
  cart,
  activeOrder,
  onOpenCart,
  isOpen,
}: FloatingCartBarProps) {
  const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // If cart is open or both cart and activeOrder are empty, don't render
  if (isOpen || (totalCount === 0 && !activeOrder)) return null;

  // MODE 1: Active Order Tracking Floating Pill (when cart is empty but active order exists)
  if (totalCount === 0 && activeOrder) {
    const getStatusText = () => {
      switch (activeOrder.status) {
        case "nuevo":
          return "Enviado · Aguardando cocina";
        case "aceptado":
          return "¡Aceptado! En preparación";
        case "en_camino":
          return activeOrder.fulfillment === "delivery"
            ? "¡En camino a tu dirección!"
            : "¡Listo para retirar!";
        case "completado":
          return "¡Entregado con éxito!";
        case "cancelado":
          return "Pedido cancelado";
        default:
          return "En proceso";
      }
    };

    return (
      <aside
        aria-label="Seguimiento de tu pedido"
        className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] pointer-events-none transition-all duration-300"
      >
        <div className="mx-auto w-full max-w-lg pointer-events-auto">
          <div
            onClick={onOpenCart}
            className="group relative flex items-center justify-between gap-3 rounded-2xl sm:rounded-full bg-[#222421]/95 backdrop-blur-xl border border-white/20 p-2 sm:p-2.5 pl-3 sm:pl-3.5 text-[#FFFDF2] shadow-[0_16px_40px_rgba(0,0,0,0.55)] cursor-pointer hover:border-[#68A01E]/60 transition-all duration-300 animate-in slide-in-from-bottom-6"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="relative flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full bg-[#68A01E] text-[#FFFDF2] shadow-md group-hover:scale-105 transition-transform">
                <PackageCheck size={18} />
                <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 border border-[#222421] animate-ping" />
              </div>

              <div className="min-w-0 flex-1 pr-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-heading font-black text-xs sm:text-sm text-[#FFFDF2] uppercase tracking-wide">
                    Pedido #{activeOrder.id}
                  </span>
                  <span className="text-[#FFFDF2]/40 text-xs">•</span>
                  <span className="font-mono text-xs font-bold text-[#7DC224] whitespace-nowrap">
                    ${activeOrder.total.toLocaleString("es-AR")}
                  </span>
                </div>
                <p className="text-[11px] text-[#FFFDF2]/80 truncate font-sans">
                  {getStatusText()}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCart();
              }}
              className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-[#68A01E] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-heading font-black uppercase tracking-wider text-[#FFFDF2] shadow-lg shadow-[#68A01E]/35 hover:bg-[#598B17] hover:scale-[1.02] active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span>Ver Estado</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // MODE 2: Active Cart Summary & CTA (when user has added dishes)
  const summaryText = cart
    .map((item) => `${item.qty}x ${item.name.split(" ")[0]}`)
    .join(", ");

  return (
    <aside
      aria-label="Resumen de tu pedido"
      className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] pointer-events-none transition-all duration-300"
    >
      <div className="mx-auto w-full max-w-lg pointer-events-auto">
        <div
          onClick={onOpenCart}
          className="group relative flex items-center justify-between gap-3 rounded-2xl sm:rounded-full bg-[#222421]/95 backdrop-blur-xl border border-white/20 p-2 sm:p-2.5 pl-3 sm:pl-3.5 text-[#FFFDF2] shadow-[0_16px_40px_rgba(0,0,0,0.55)] cursor-pointer hover:border-[#8F9E4B]/60 transition-all duration-300 animate-in slide-in-from-bottom-6"
        >
          {/* Left: Cart badge & items summary */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="relative flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full bg-[#68A01E] text-[#FFFDF2] shadow-md group-hover:scale-105 transition-transform">
              <ShoppingBag size={18} />
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#222421] border border-white/40 text-[10px] font-heading font-black text-[#FFFDF2]">
                {totalCount}
              </span>
            </div>

            <div className="min-w-0 flex-1 pr-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-heading font-black text-xs sm:text-sm text-[#FFFDF2] uppercase tracking-wide">
                  {totalCount} {totalCount === 1 ? "vianda" : "viandas"}
                </span>
                <span className="text-[#FFFDF2]/40 text-xs">•</span>
                <span className="font-heading font-black text-xs sm:text-sm text-[#7DC224] whitespace-nowrap">
                  ${subtotal.toLocaleString("es-AR")}
                </span>
              </div>
              <p className="text-[11px] text-[#FFFDF2]/75 truncate font-sans">
                {summaryText}
              </p>
            </div>
          </div>

          {/* Right: Primary "Comprar" Action Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCart();
            }}
            className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-[#68A01E] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-heading font-black uppercase tracking-wider text-[#FFFDF2] shadow-lg shadow-[#68A01E]/35 hover:bg-[#598B17] hover:scale-[1.02] active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <span>Comprar</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
}
