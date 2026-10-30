"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Send,
  AlertCircle,
  Truck,
  Store,
} from "lucide-react";
import type { CartLine, Customer, Fulfillment, Payment, Store as StoreType } from "@/lib/types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartLine[];
  onUpdateQty: (lineId: string, qty: number) => void;
  onClearCart: () => void;
  store: StoreType;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onClearCart,
  store,
}: CartDrawerProps) {
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    address: "",
    when: "Lo antes posible",
    payment: "efectivo",
    note: "",
  });

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, line) => acc + line.price * line.qty, 0);
  const deliveryFee = fulfillment === "delivery" ? store.deliveryFee : 0;
  const total = subtotal + deliveryFee;
  const isBelowDeliveryMin =
    fulfillment === "delivery" && subtotal > 0 && subtotal < store.deliveryMin;

  const handleSendWhatsApp = () => {
    if (cart.length === 0) return;

    if (!customer.name.trim()) {
      alert("Por favor indicá tu nombre para el pedido.");
      return;
    }

    if (fulfillment === "delivery" && !customer.address.trim()) {
      alert("Por favor indicá tu dirección para el envío.");
      return;
    }

    const itemsText = cart
      .map((line) => `• ${line.qty}x ${line.name} ($${(line.price * line.qty).toLocaleString("es-AR")})`)
      .join("\n");

    const messageLines = [
      `¡Hola *abrí y serví*! 👋 Quiero hacer este pedido de comida envasada al vacío:`,
      ``,
      `🍽️ *DETALLE DEL PEDIDO:*`,
      itemsText,
      ``,
      `📦 *MODALIDAD:* ${fulfillment === "delivery" ? "Envío a domicilio" : "Retiro por el local"}`,
      fulfillment === "delivery" ? `📍 *DIRECCIÓN:* ${customer.address}` : `📍 *RETIRO EN:* ${store.address}`,
      `👤 *NOMBRE:* ${customer.name}`,
      customer.phone ? `📞 *TELÉFONO:* ${customer.phone}` : null,
      `⏰ *CUÁNDO:* ${customer.when}`,
      `💳 *FORMA DE PAGO:* ${customer.payment === "efectivo" ? "Efectivo" : "Transferencia bancaria"}`,
      customer.note ? `📝 *NOTAS:* ${customer.note}` : null,
      ``,
      `💰 *SUBTOTAL:* $${subtotal.toLocaleString("es-AR")}`,
      fulfillment === "delivery" ? `🛵 *ENVÍO:* $${deliveryFee.toLocaleString("es-AR")}` : null,
      `🔥 *TOTAL:* $${total.toLocaleString("es-AR")}`,
      ``,
      `¡Muchas gracias!`,
    ].filter(Boolean);

    const waUrl = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(
      messageLines.join("\n")
    )}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#222421]/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Container: Full width on mobile, max-w-md on desktop with zero side cutoffs */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md flex z-50">
        <div className="w-full h-full bg-[#FFFDF2] border-l border-[#DFD8C4] shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[#DFD8C4] flex items-center justify-between bg-[#FFFFFF] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#8F9E4B] flex items-center justify-center text-[#FFFDF2] shrink-0">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h3 className="font-heading font-black text-base sm:text-lg text-[#222421] uppercase tracking-wide leading-tight">
                  Tu Pedido
                </h3>
                <span className="text-[11px] text-[#5E4B3C] font-heading font-semibold uppercase">
                  {cart.length} {cart.length === 1 ? "ítem" : "ítems"} al vacío
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#F4EFE3] hover:bg-[#DFD8C4] flex items-center justify-center text-[#222421] transition-colors shrink-0"
              aria-label="Cerrar pedido"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {cart.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#F4EFE3] flex items-center justify-center text-[#5E4B3C] mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h4 className="font-heading font-bold text-base uppercase text-[#222421]">
                  Tu canasta está vacía
                </h4>
                <p className="font-sans text-xs text-[#5E4B3C] max-w-xs mt-1">
                  Elegí tus platos envasados al vacío favoritos y sumalos para cocinar en 8 minutos.
                </p>
              </div>
            ) : (
              <>
                {/* Cart Lines List */}
                <div className="space-y-2.5">
                  {cart.map((line) => (
                    <div
                      key={line.lineId}
                      className="p-3 sm:p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#DFD8C4] flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex-1 min-w-0 pr-1">
                        <h4 className="font-heading font-bold text-xs sm:text-sm text-[#222421] uppercase tracking-wide truncate leading-snug">
                          {line.name}
                        </h4>
                        <span className="text-[11px] font-heading font-semibold text-[#5E4B3C]">
                          ${line.price.toLocaleString("es-AR")} c/u
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onUpdateQty(line.lineId, line.qty - 1)}
                          className="w-7 h-7 rounded-full bg-[#F4EFE3] hover:bg-[#DFD8C4] flex items-center justify-center text-[#222421] transition-colors"
                          aria-label="Restar una unidad"
                        >
                          {line.qty === 1 ? <Trash2 size={12} className="text-[#B93826]" /> : <Minus size={12} />}
                        </button>
                        <span className="w-5 text-center font-heading font-bold text-xs text-[#222421]">
                          {line.qty}
                        </span>
                        <button
                          onClick={() => onUpdateQty(line.lineId, line.qty + 1)}
                          className="w-7 h-7 rounded-full bg-[#8F9E4B] hover:bg-[#7D8B3F] flex items-center justify-center text-[#FFFDF2] transition-colors"
                          aria-label="Sumar una unidad"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right shrink-0 pl-1 min-w-[70px]">
                        <span className="font-heading font-black text-xs sm:text-sm text-[#222421] whitespace-nowrap">
                          ${(line.price * line.qty).toLocaleString("es-AR")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery vs Pickup Toggle */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFFFF] border border-[#DFD8C4]">
                  <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block mb-2">
                    Forma de Entrega
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFulfillment("delivery")}
                      className={`py-2 px-2.5 rounded-xl font-heading text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                        fulfillment === "delivery"
                          ? "bg-[#8F9E4B] text-[#FFFDF2] border-[#8F9E4B] shadow-xs"
                          : "bg-[#FFFDF2] text-[#222421] border-[#DFD8C4]"
                      }`}
                    >
                      <Truck size={13} className="shrink-0" />
                      <span className="truncate">Envío ($2.000)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillment("pickup")}
                      className={`py-2 px-2.5 rounded-xl font-heading text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                        fulfillment === "pickup"
                          ? "bg-[#8F9E4B] text-[#FFFDF2] border-[#8F9E4B] shadow-xs"
                          : "bg-[#FFFDF2] text-[#222421] border-[#DFD8C4]"
                      }`}
                    >
                      <Store size={13} className="shrink-0" />
                      <span className="truncate">Retiro Gratis</span>
                    </button>
                  </div>

                  {isBelowDeliveryMin && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#FFFDF2] border border-[#B93826]/30 flex items-start gap-2 text-xs text-[#B93826]">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>
                        El mínimo para delivery es ${store.deliveryMin.toLocaleString("es-AR")}.
                        Te faltan ${(store.deliveryMin - subtotal).toLocaleString("es-AR")}.
                      </span>
                    </div>
                  )}
                </div>

                {/* Customer Details Form */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFFFF] border border-[#DFD8C4] space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#5E4B3C] font-heading block">
                    Tus Datos para el Pedido
                  </span>

                  <div>
                    <label className="text-[11px] font-sans text-[#5E4B3C] block mb-1">
                      Tu Nombre *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Laura Martínez"
                      value={customer.name}
                      onChange={(e) =>
                        setCustomer((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] text-xs font-sans text-[#222421] focus:outline-none focus:border-[#8F9E4B]"
                    />
                  </div>

                  {fulfillment === "delivery" && (
                    <div>
                      <label className="text-[11px] font-sans text-[#5E4B3C] block mb-1">
                        Dirección de Envío *
                      </label>
                      <input
                        type="text"
                        placeholder="Calle, número, piso/depto"
                        value={customer.address}
                        onChange={(e) =>
                          setCustomer((prev) => ({ ...prev, address: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] text-xs font-sans text-[#222421] focus:outline-none focus:border-[#8F9E4B]"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-sans text-[#5E4B3C] block mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        placeholder="WhatsApp"
                        value={customer.phone}
                        onChange={(e) =>
                          setCustomer((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] text-xs font-sans text-[#222421] focus:outline-none focus:border-[#8F9E4B]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-sans text-[#5E4B3C] block mb-1">
                        Medio de Pago
                      </label>
                      <select
                        value={customer.payment}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            payment: e.target.value as Payment,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] text-xs font-sans text-[#222421] focus:outline-none focus:border-[#8F9E4B]"
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-sans text-[#5E4B3C] block mb-1">
                      Aclaraciones o timbre
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Timbre no anda, avisar por WhatsApp"
                      value={customer.note}
                      onChange={(e) =>
                        setCustomer((prev) => ({ ...prev, note: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] text-xs font-sans text-[#222421] focus:outline-none focus:border-[#8F9E4B]"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer Checkout Button */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#DFD8C4] bg-[#FFFFFF] space-y-3 shrink-0">
              <div className="space-y-1 text-xs font-sans text-[#5E4B3C]">
                <div className="flex justify-between items-center">
                  <span>Subtotal comida</span>
                  <span className="font-heading font-bold text-[#222421] whitespace-nowrap">
                    ${subtotal.toLocaleString("es-AR")}
                  </span>
                </div>
                {fulfillment === "delivery" && (
                  <div className="flex justify-between items-center">
                    <span>Costo de envío</span>
                    <span className="font-heading font-bold text-[#222421] whitespace-nowrap">
                      ${deliveryFee.toLocaleString("es-AR")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm sm:text-base font-heading font-black text-[#222421] pt-2 border-t border-[#DFD8C4]">
                  <span>TOTAL FINAL</span>
                  <span className="whitespace-nowrap">${total.toLocaleString("es-AR")}</span>
                </div>
              </div>

              <button
                onClick={handleSendWhatsApp}
                type="button"
                disabled={isBelowDeliveryMin}
                className={`w-full py-3.5 sm:py-4 rounded-full font-heading font-black text-xs sm:text-sm uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all ${
                  isBelowDeliveryMin
                    ? "bg-[#DFD8C4] text-[#5E4B3C] cursor-not-allowed"
                    : "bg-[#668032] hover:bg-[#576D2B] text-[#FFFDF2] active:scale-98"
                }`}
              >
                <Send size={15} />
                <span>Confirmar por WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
