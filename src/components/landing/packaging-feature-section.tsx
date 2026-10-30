"use client";

import React from "react";
import Image from "next/image";
import { ColdStorageIcon, PotBoilingIcon, ScissorsCutIcon, SparkleCluster } from "@/components/brand/brand-icons";
import { ShieldCheck, Leaf, HeartHandshake, Sparkles, CheckCircle2 } from "lucide-react";

export function PackagingFeatureSection() {
  const features = [
    {
      title: "0% Conservantes Químicos",
      desc: "El sellado al vacío extrae el oxígeno y bloquea la oxidación de forma natural. No necesitamos aditivos ni conservantes: solo comida real.",
      icon: <Leaf size={24} className="text-[#668032]" />,
    },
    {
      title: "Jugos y Colágenos Sellados",
      desc: "Al hervir la bolsa cerrada, el vapor no escapa. Toda la reducción y salsa se reabsorbe en la fibra de la carne, garantizando máxima terneza.",
      icon: <PotBoilingIcon size={24} className="text-[#8F9E4B]" />,
    },
    {
      title: "7 Días en Frío / 3 Meses Freezer",
      desc: "Mantené tu heladera equipada con platos caseros a 0-4°C para la semana, o guardalos en el freezer a -18°C sin riesgo de quemaduras por frío.",
      icon: <ColdStorageIcon size={24} className="text-[#5E4B3C]" />,
    },
    {
      title: "Sin Ollas Sucias ni Olores",
      desc: "El agua de la olla se mantiene limpia porque el paquete está hermético. Ni humo, ni grasa en la mesada, ni olor a cocción en el ambiente.",
      icon: <ScissorsCutIcon size={24} className="text-[#8F9E4B]" />,
    },
  ];

  return (
    <section
      id="por-que-vacio"
      className="w-full py-20 sm:py-28 bg-[#222421] text-[#FFFDF2] relative overflow-hidden"
    >
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#8F9E4B]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#5E4B3C]/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Story & Feature Grid */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8F9E4B]/20 text-[#8F9E4B] text-xs font-heading font-bold uppercase tracking-wider mb-4 border border-[#8F9E4B]/30">
              <ShieldCheck size={13} />
              <span>Garantía de Calidad e Higiene</span>
            </div>

            <h2 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#FFFDF2] leading-tight mb-6 text-balance">
              La técnica del vacío al servicio del sabor de hogar
            </h2>

            <p className="font-sans text-base sm:text-lg text-[#FFFDF2]/85 leading-relaxed mb-10 text-balance">
              Durante décadas, la alta cocina europea utilizó el envasado al vacío (sous-vide)
              en secreto para lograr puntos de cocción inalcanzables en hornallas comunes.
              En <strong>abrí y serví</strong> trasladamos esa precisión a los clásicos que más
              te gustan: pastel de papa, carnes al horno, canelones caseros y guisados de campo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#FFFDF2]/5 border border-[#FFFDF2]/10 p-5 hover:border-[#8F9E4B]/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFFDF2]/10 flex items-center justify-center mb-3">
                    {item.icon}
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#FFFDF2] uppercase tracking-wide mb-1.5">
                    {item.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#FFFDF2]/70 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Brand Card with Video / Image Demonstration */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-[#FFFDF2]/10 border border-[#8F9E4B]/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
              {/* Top seal badge */}
              <div className="w-20 h-20 rounded-full bg-[#8F9E4B] flex items-center justify-center text-[#FFFDF2] font-script text-3xl shadow-lg border-2 border-[#FFFDF2] mb-6 animate-pulse">
                a&s
              </div>

              <h3 className="font-heading font-black text-2xl uppercase tracking-tight text-[#FFFDF2] mb-2">
                Empacado en poliamida técnica
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#FFFDF2]/80 leading-relaxed mb-6">
                Bolsas libres de BPA aptas para cocción a altas temperaturas y congelación profunda.
                Resistentes a la condensación, agua hirviendo y manipulación.
              </p>

              {/* Video mini loop */}
              <div className="w-full h-52 rounded-2xl overflow-hidden border border-[#FFFDF2]/20 relative shadow-inner">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover filter brightness-[0.88]"
                >
                  <source src="/videos/gemini_generated_video_3e849150.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-[#222421]/70 via-transparent to-transparent flex items-end justify-center p-3">
                  <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#FFFDF2] bg-[#8F9E4B] px-3 py-1 rounded-full">
                    Sello hermético de seguridad
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-[#8F9E4B]">
                <CheckCircle2 size={16} />
                <span>Normas bromatológicas certificadas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
