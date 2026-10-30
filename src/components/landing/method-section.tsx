"use client";

import React from "react";
import { PotBoilingIcon, ScissorsCutIcon, PlateServeIcon, SparkleCluster } from "@/components/brand/brand-icons";
import { CheckCircle2, Flame, Sparkles } from "lucide-react";

export function MethodSection() {
  const steps = [
    {
      num: "01",
      icon: <PotBoilingIcon size={32} className="text-[#8F9E4B]" />,
      title: "Herví sin abrir",
      time: "8 a 10 minutos",
      desc: "Colocá la bolsa sellada al vacío directo en una olla con agua hirviendo. No la abras: el calor se distribuye parejo y la comida se regenera en su propio jugo sin perder humedad ni sabor.",
      tip: "Pastas finas solo 5 min · Guisados y carnes 8-10 min",
    },
    {
      num: "02",
      icon: <ScissorsCutIcon size={32} className="text-[#8F9E4B]" />,
      title: "Cortá la bolsa",
      time: "Apertura limpia",
      desc: "Retirá la bolsa del agua tomándola del borde superior con los dedos o una pinza (el borde no quema). Cortá con tijera o tirá de la muesca lateral.",
      tip: "Cero salpicaduras ni olor a fritura en tu casa",
    },
    {
      num: "03",
      icon: <PlateServeIcon size={32} className="text-[#8F9E4B]" />,
      title: "¡Abrí y serví!",
      time: "Listo para comer",
      desc: "Volcá directo en tu plato hondo favorito. Verás desprenderse una nube de vapor fragante y salsas con el brillo de recién terminadas en la sartén.",
      tip: "Lavás un solo plato y un tenedor. Fin.",
    },
  ];

  return (
    <section id="metodo" className="w-full py-20 sm:py-28 bg-[#FFFDF2] relative overflow-hidden">
      {/* Decorative background grid / accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8F9E4B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#5E4B3C]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8F9E4B]/15 text-[#668032] text-xs font-heading font-bold uppercase tracking-wider mb-3">
            <Flame size={13} />
            <span>Regeneración Térmica Rápida</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-[#222421] uppercase tracking-tight text-balance">
            El Ritual: 3 pasos para comer como en casa
          </h2>
          <p className="font-sans text-base sm:text-lg text-[#5E4B3C] font-normal mt-4 text-balance">
            Olvidate del delivery tibio, de descongelar en microondas que seca la comida
            o de pasar 2 horas cocinando. Nuestro sistema conserva la frescura intacta.
          </p>
        </div>

        {/* 3 Step Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              id={idx === 2 ? "metodo-paso-3" : undefined}
              className={`relative rounded-2xl bg-[#FFFFFF] p-7 sm:p-8 shadow-sm border border-[#DFD8C4] hover:shadow-md hover:border-[#8F9E4B]/50 transition-all group flex flex-col justify-between ${
                idx === 2 ? "scroll-mt-28" : ""
              }`}
            >
              {/* Step counter badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-heading font-black text-3xl sm:text-4xl text-[#8F9E4B]/35 group-hover:text-[#8F9E4B] transition-colors">
                  {step.num}
                </span>
                <div className="w-14 h-14 rounded-2xl bg-[#FFFDF2] border border-[#DFD8C4] flex items-center justify-center group-hover:scale-110 group-hover:border-[#8F9E4B] transition-transform shadow-xs">
                  {step.icon}
                </div>
              </div>

              {/* Title & Time */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#668032] bg-[#8F9E4B]/10 px-2 py-0.5 rounded">
                    {step.time}
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#222421] uppercase tracking-wide">
                  {step.title}
                </h3>
              </div>

              {/* Description */}
              <p className="font-sans text-sm text-[#222421]/80 leading-relaxed mb-6">
                {step.desc}
              </p>

              {/* Tip Pill */}
              <div className="pt-4 border-t border-[#DFD8C4]/60 flex items-start gap-2 text-xs text-[#5E4B3C] font-medium">
                <CheckCircle2 size={14} className="text-[#668032] shrink-0 mt-0.5" />
                <span>{step.tip}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Video Showcase Banner */}
        <div className="rounded-3xl bg-[#222421] text-[#FFFDF2] p-6 sm:p-10 relative overflow-hidden shadow-xl border border-[#8F9E4B]/30 flex flex-col lg:flex-row items-center gap-8 justify-between">
          <div className="max-w-xl text-left">
            <span className="text-xs uppercase font-heading font-bold tracking-widest text-[#8F9E4B] block mb-2">
              Ciencia culinaria & practicidad
            </span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#FFFDF2] mb-3">
              ¿Por qué en agua hirviendo y no en microondas?
            </h3>
            <p className="font-sans text-sm sm:text-base text-[#FFFDF2]/80 leading-relaxed">
              El microondas calienta por fricción molecular, evaporando el agua y dejando la
              carne gomosa y el puré reseco. El baño maría en bolsa sellada mantiene los 100°C
              de forma envolvente y uniforme, devolviendo al plato exactamente el mismo punto
              de cocción que cuando el cocinero apagó el fuego.
            </p>
          </div>

          {/* Steaming pot video clip preview */}
          <div className="relative w-full sm:w-72 md:w-80 h-48 rounded-2xl overflow-hidden border-2 border-[#8F9E4B]/40 shadow-inner shrink-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover filter brightness-[0.85]"
            >
              <source src="/videos/aa.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[#222421]/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#FFFDF2] bg-[#8F9E4B]/80 px-2.5 py-1 rounded-full backdrop-blur-sm">
                Baño maría a 100°C
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
