"use client";

import React, { useState, useEffect } from "react";
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
  Clock,
  Ban,
  PackageCheck,
  Flame,
  CheckCircle2,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { getStoreScheduleStatus } from "@/lib/schedule";
import type { CartLine, Customer, Fulfillment, Payment, Store as StoreType, Order } from "@/lib/types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartLine[];
  onUpdateQty: (lineId: string, qty: number) => void;
  onClearCart: () => void;
  store: StoreType;
  activeOrder?: Order | null;
  onSetActiveOrder?: (order: Order | null) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onClearCart,
  store,
  activeOrder,
  onSetActiveOrder,
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

  // Poll live order status when activeOrder exists
  useEffect(() => {
    if (!activeOrder?.id || !isOpen) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders?id=${activeOrder.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order && data.order.status !== activeOrder.status) {
            onSetActiveOrder?.(data.order);
            try {
              localStorage.setItem("abriyservi_active_order", JSON.stringify(data.order));
            } catch {
              // Ignore
            }
          }
        }
      } catch (err) {
        console.warn("Error polling order status:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeOrder?.id, activeOrder?.status, isOpen, onSetActiveOrder]);

  if (!isOpen) return null;

  const scheduleStatus = getStoreScheduleStatus(store);
  const isDeliveryBlocked = fulfillment === "delivery" && !scheduleStatus.canDeliver;
  const subtotal = cart.reduce((acc, line) => acc + line.price * line.qty, 0);
  const deliveryFee = fulfillment === "delivery" ? store.deliveryFee : 0;
  const total = subtotal + deliveryFee;
  const isBelowDeliveryMin =
    fulfillment === "delivery" && subtotal > 0 && subtotal < store.deliveryMin;

  const handleSendWhatsApp = () => {
    if (cart.length === 0) return;

    if (isDeliveryBlocked) {
      alert(
        scheduleStatus.reason ||
          "El local se encuentra cerrado para pedidos de delivery en este momento."
      );
      return;
    }

    if (!customer.name.trim()) {
      alert("Por favor indicá tu nombre para el pedido.");
      return;
    }

    if (!customer.phone.trim()) {
      alert("Por favor indicá tu número de teléfono o WhatsApp.");
      return;
    }

    if (customer.phone.replace(/\D/g, "").length < 8) {
      alert("Por favor ingresá un número de teléfono válido (mínimo 8 dígitos).");
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
      `📞 *TELÉFONO:* ${customer.phone.trim()}`,
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

    const orderPayload = {
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim(),
      customerAddress: fulfillment === "delivery" ? customer.address.trim() : undefined,
      fulfillment,
      payment: customer.payment,
      note: customer.note.trim() || undefined,
      items: cart.map((line) => ({
        dishId: line.dishId,
        name: line.name,
        price: line.price,
        qty: line.qty,
      })),
      subtotal,
      deliveryFee,
      total,
    };

    const tempId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const optimisticOrder: Order = {
      ...orderPayload,
      id: tempId,
      status: "nuevo",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Immediate transition for 0ms lag
    onSetActiveOrder?.(optimisticOrder);
    try {
      localStorage.setItem("abriyservi_active_order", JSON.stringify(optimisticOrder));
    } catch {
      // Ignore
    }
    onClearCart();

    // Open WhatsApp
    window.open(waUrl, "_blank");

    // Persist to server database and update order ID
    fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(orderPayload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          onSetActiveOrder?.(data.order);
          try {
            localStorage.setItem("abriyservi_active_order", JSON.stringify(data.order));
          } catch {
            // Ignore
          }
        }
      })
      .catch((err) => console.warn("Error tracking order:", err));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#222421]/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Container: Full width on mobile, max-w-md on desktop */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md flex z-50">
        {activeOrder ? (
          /* LIVE ORDER TRACKING SCREEN */
          <div className="w-full h-full bg-[#FFFDF2] border-l border-[#DFD8C4] shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#DFD8C4] flex items-center justify-between bg-[#FFFFFF] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full bg-[#68A01E] flex items-center justify-center text-[#FFFDF2] shrink-0 shadow-xs">
                  <PackageCheck size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-black text-base sm:text-lg text-[#222421] uppercase tracking-wide leading-tight">
                      Tu Pedido
                    </h3>
                    <span className="font-mono text-xs font-bold text-[#5E4B3C]">
                      #{activeOrder.id}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] text-[#68A01E] font-heading font-bold uppercase">
                    <span className="size-2 rounded-full bg-[#68A01E] animate-ping" />
                    <span>Estado en tiempo real</span>
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="size-9 rounded-full bg-[#F4EFE3] hover:bg-[#DFD8C4] flex items-center justify-center text-[#222421] transition-colors shrink-0 cursor-pointer"
                aria-label="Cerrar pedido"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tracking Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Stepper Status Card */}
              <div className="rounded-2xl border border-[#DFD8C4] bg-[#FFFFFF] p-4 sm:p-5 space-y-4 shadow-2xs">
                <span className="text-[10px] font-heading font-black uppercase tracking-wider text-[#5E4B3C] block">
                  Seguimiento de Preparación
                </span>

                {activeOrder.status === "cancelado" ? (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-900 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-heading font-black uppercase text-red-800">
                      <Ban size={15} />
                      <span>Pedido Cancelado</span>
                    </div>
                    <p className="text-[11px] text-red-950/80">
                      Tu pedido fue cancelado. Por favor comunicate directo por WhatsApp con el local ante cualquier consulta.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#DFD8C4]">
                    {/* Step 1: Enviado */}
                    <div className="flex items-start gap-3 relative">
                      <div
                        className={`size-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors shadow-2xs ${
                          ["nuevo", "aceptado", "en_camino", "completado"].includes(activeOrder.status)
                            ? "bg-[#68A01E] text-white"
                            : "bg-[#DFD8C4] text-[#5E4B3C]"
                        }`}
                      >
                        <Send size={13} />
                      </div>
                      <div>
                        <h4 className="font-heading font-black text-xs sm:text-sm uppercase text-[#222421]">
                          1. Pedido Enviado
                        </h4>
                        <p className="text-[11px] text-[#5E4B3C] mt-0.5">
                          {activeOrder.status === "nuevo"
                            ? "Recibido en cocina. Aguardando confirmación..."
                            : "Recibido y confirmado correctamente."}
                        </p>
                      </div>
                    </div>

                    {/* Step 2: Aceptado */}
                    <div className="flex items-start gap-3 relative">
                      <div
                        className={`size-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors shadow-2xs ${
                          ["aceptado", "en_camino", "completado"].includes(activeOrder.status)
                            ? "bg-[#68A01E] text-white"
                            : "bg-[#F4EFE3] text-[#5E4B3C] border border-[#DFD8C4]"
                        }`}
                      >
                        <Flame size={13} />
                      </div>
                      <div>
                        <h4
                          className={`font-heading font-black text-xs sm:text-sm uppercase ${
                            ["aceptado", "en_camino", "completado"].includes(activeOrder.status)
                              ? "text-[#222421]"
                              : "text-[#5E4B3C]/60"
                          }`}
                        >
                          2. Aceptado en Cocina
                        </h4>
                        <p className="text-[11px] text-[#5E4B3C] mt-0.5">
                          {activeOrder.status === "aceptado"
                            ? "¡Confirmado! Cocinando y preparando tus viandas al vacío."
                            : ["en_camino", "completado"].includes(activeOrder.status)
                            ? "Viandas preparadas con sellado hermético."
                            : "Pendiente de aceptación."}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: En camino / Listo para retiro */}
                    <div className="flex items-start gap-3 relative">
                      <div
                        className={`size-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors shadow-2xs ${
                          ["en_camino", "completado"].includes(activeOrder.status)
                            ? "bg-[#68A01E] text-white"
                            : "bg-[#F4EFE3] text-[#5E4B3C] border border-[#DFD8C4]"
                        }`}
                      >
                        {activeOrder.fulfillment === "delivery" ? <Truck size={13} /> : <Store size={13} />}
                      </div>
                      <div>
                        <h4
                          className={`font-heading font-black text-xs sm:text-sm uppercase ${
                            ["en_camino", "completado"].includes(activeOrder.status)
                              ? "text-[#222421]"
                              : "text-[#5E4B3C]/60"
                          }`}
                        >
                          {activeOrder.fulfillment === "delivery" ? "3. En Camino" : "3. Listo para Retirar"}
                        </h4>
                        <p className="text-[11px] text-[#5E4B3C] mt-0.5">
                          {activeOrder.status === "en_camino"
                            ? activeOrder.fulfillment === "delivery"
                              ? `El repartidor va en camino a ${activeOrder.customerAddress || "tu domicilio"}.`
                              : `Ya podés pasar a retirar tu pedido por ${store.address}.`
                            : activeOrder.status === "completado"
                            ? "Despachado correctamente."
                            : "A la espera de empaque final."}
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Entregado */}
                    <div className="flex items-start gap-3 relative">
                      <div
                        className={`size-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors shadow-2xs ${
                          activeOrder.status === "completado"
                            ? "bg-[#68A01E] text-white"
                            : "bg-[#F4EFE3] text-[#5E4B3C] border border-[#DFD8C4]"
                        }`}
                      >
                        <CheckCircle2 size={13} />
                      </div>
                      <div>
                        <h4
                          className={`font-heading font-black text-xs sm:text-sm uppercase ${
                            activeOrder.status === "completado" ? "text-[#222421]" : "text-[#5E4B3C]/60"
                          }`}
                        >
                          4. Entregado
                        </h4>
                        <p className="text-[11px] text-[#5E4B3C] mt-0.5">
                          {activeOrder.status === "completado"
                            ? "¡Pedido completado! Que disfrutes tu comida casera."
                            : "Paso final de entrega."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Details Card */}
              <div className="rounded-2xl border border-[#DFD8C4] bg-[#FFFFFF] p-4 sm:p-5 space-y-3 shadow-2xs">
                <span className="text-[10px] font-heading font-black uppercase tracking-wider text-[#5E4B3C] block">
                  Detalle del Pedido
                </span>

                <div className="space-y-1.5 text-xs">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[#222421]">
                      <span>
                        <strong>{item.qty}x</strong> {item.name}
                      </span>
                      <span className="font-mono text-[#5E4B3C]">
                        ${(item.price * item.qty).toLocaleString("es-AR")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#DFD8C4] pt-2.5 mt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-[#5E4B3C]">
                    <span>Modalidad</span>
                    <strong className="text-[#222421] uppercase font-heading text-[11px]">
                      {activeOrder.fulfillment === "delivery" ? "🛵 Envío a domicilio" : "🏪 Retiro en local"}
                    </strong>
                  </div>
                  {activeOrder.customerAddress && (
                    <div className="flex justify-between text-[#5E4B3C]">
                      <span>Dirección</span>
                      <span className="text-[#222421] text-right font-medium">{activeOrder.customerAddress}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#5E4B3C]">
                    <span>Medio de pago</span>
                    <strong className="text-[#222421] uppercase font-heading text-[11px]">
                      {activeOrder.payment === "efectivo" ? "Efectivo" : "Transferencia"}
                    </strong>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base font-heading font-black text-[#222421] pt-1.5 border-t border-[#DFD8C4]/60">
                    <span>Total</span>
                    <span className="text-[#68A01E]">${activeOrder.total.toLocaleString("es-AR")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-[#DFD8C4] bg-[#FFFFFF] space-y-2.5 shrink-0">
              <a
                href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(
                  `¡Hola! Quiero consultar por mi pedido #${activeOrder.id} a nombre de ${activeOrder.customerName}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-full bg-[#68A01E] hover:bg-[#598B17] text-[#FFFDF2] font-heading font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <MessageCircle size={15} />
                <span>Consultar por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm("¿Deseás iniciar un nuevo pedido? Se cerrará el seguimiento del pedido actual.")) {
                    onSetActiveOrder?.(null);
                    try {
                      localStorage.removeItem("abriyservi_active_order");
                    } catch {
                      // Ignore
                    }
                  }
                }}
                className="w-full py-2.5 rounded-full border border-[#DFD8C4] hover:bg-[#FFFDF2] text-[#5E4B3C] font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Hacer otro pedido</span>
              </button>
            </div>
          </div>
        ) : (
          /* REGULAR CART CHECKOUT VIEW */
          <div className="w-full h-full bg-[#FFFDF2] border-l border-[#DFD8C4] shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-[#DFD8C4] flex items-center justify-between bg-[#FFFFFF] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#68A01E] flex items-center justify-center text-[#FFFDF2] shrink-0">
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
                className="w-9 h-9 rounded-full bg-[#F4EFE3] hover:bg-[#DFD8C4] flex items-center justify-center text-[#222421] transition-colors shrink-0 cursor-pointer"
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
                            className="w-7 h-7 rounded-full bg-[#F4EFE3] hover:bg-[#DFD8C4] flex items-center justify-center text-[#222421] transition-colors cursor-pointer"
                            aria-label="Restar una unidad"
                          >
                            {line.qty === 1 ? <Trash2 size={12} className="text-[#B93826]" /> : <Minus size={12} />}
                          </button>
                          <span className="w-5 text-center font-heading font-bold text-xs text-[#222421]">
                            {line.qty}
                          </span>
                          <button
                            onClick={() => onUpdateQty(line.lineId, line.qty + 1)}
                            className="w-7 h-7 rounded-full bg-[#68A01E] hover:bg-[#598B17] flex items-center justify-center text-[#FFFDF2] transition-colors cursor-pointer"
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
                        className={`relative py-2 px-2.5 rounded-xl font-heading text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          fulfillment === "delivery"
                            ? !scheduleStatus.canDeliver
                              ? "bg-amber-600 text-[#FFFDF2] border-amber-600 shadow-xs"
                              : "bg-[#68A01E] text-[#FFFDF2] border-[#68A01E] shadow-xs"
                            : "bg-[#FFFDF2] text-[#222421] border-[#DFD8C4]"
                        }`}
                      >
                        <Truck size={13} className="shrink-0" />
                        <span className="truncate">Envío (${store.deliveryFee.toLocaleString("es-AR")})</span>
                        {!scheduleStatus.canDeliver && (
                          <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 px-1.5 py-0.2 text-[8px] font-black uppercase text-white shadow-2xs">
                            Cerrado
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFulfillment("pickup")}
                        className={`py-2 px-2.5 rounded-xl font-heading text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          fulfillment === "pickup"
                            ? "bg-[#68A01E] text-[#FFFDF2] border-[#68A01E] shadow-xs"
                            : "bg-[#FFFDF2] text-[#222421] border-[#DFD8C4]"
                        }`}
                      >
                        <Store size={13} className="shrink-0" />
                        <span className="truncate">Retiro Gratis</span>
                      </button>
                    </div>

                    {/* Simple notice when delivery is closed */}
                    {isDeliveryBlocked && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-xs text-amber-900">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Clock size={13} className="text-amber-700 shrink-0" />
                          <span className="font-heading font-black text-[10px] uppercase truncate">
                            Cerrado para delivery · Horario: {store.hours}
                          </span>
                        </div>
                        {store.pickupEnabled && (
                          <button
                            type="button"
                            onClick={() => setFulfillment("pickup")}
                            className="shrink-0 font-heading text-[10px] font-black uppercase text-[#68A01E] underline hover:text-[#598B17] cursor-pointer"
                          >
                            Elegir retiro
                          </button>
                        )}
                      </div>
                    )}

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
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] text-xs font-sans text-[#222421] focus:outline-none focus:border-[#68A01E]"
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
                          className="w-full px-3 py-2 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] text-xs font-sans text-[#222421] focus:outline-none focus:border-[#68A01E]"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-sans text-[#5E4B3C] block mb-1">
                          Teléfono *
                        </label>
                        <input
                          required
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="WhatsApp / Tel *"
                          value={customer.phone}
                          onChange={(e) =>
                            setCustomer((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] text-xs font-sans text-[#222421] focus:outline-none focus:border-[#68A01E]"
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
                          className="w-full px-3 py-2 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] text-xs font-sans text-[#222421] focus:outline-none focus:border-[#68A01E]"
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
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFDF2] border border-[#DFD8C4] text-xs font-sans text-[#222421] focus:outline-none focus:border-[#68A01E]"
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
                  disabled={isBelowDeliveryMin || isDeliveryBlocked}
                  className={`w-full py-3.5 sm:py-4 rounded-full font-heading font-black text-xs sm:text-sm uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isDeliveryBlocked
                      ? "bg-amber-100 border border-amber-300 text-amber-800 cursor-not-allowed opacity-95"
                      : isBelowDeliveryMin
                      ? "bg-[#DFD8C4] text-[#5E4B3C] cursor-not-allowed"
                      : "bg-[#68A01E] hover:bg-[#598B17] text-[#FFFDF2] active:scale-98 shadow-[#68A01E]/30"
                  }`}
                >
                  {isDeliveryBlocked ? (
                    <>
                      <Ban size={15} />
                      <span>Cerrado para delivery</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Confirmar por WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
