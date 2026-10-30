"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ArrowDown, Flame, CheckCircle2 } from "lucide-react";
import { PotBoilingIcon, ScissorsCutIcon, PlateServeIcon } from "@/components/brand/brand-icons";

interface StepInfo {
  id: string;
  num: string;
  startTime: number;
  endTime: number;
  title: string;
  subtitle: string;
  desc: string;
  tip: string;
  icon: React.ReactNode;
}

const STEPS: StepInfo[] = [
  {
    id: "sumergi",
    num: "01",
    startTime: 2.0,
    endTime: 8.0,
    title: "1. Sumergí pack",
    subtitle: "Colocá la bolsa sin abrir",
    desc: "Colocá la bolsa sellada al vacío directo en una olla con agua hirviendo a 100°C. No la abras: el calor distribuye parejo y la comida se regenera en su propio jugo sin perder humedad.",
    tip: "8 a 10 min guisados y carnes · 5 min pastas finas",
    icon: <PotBoilingIcon size={24} className="text-[#8F9E4B]" />,
  },
  {
    id: "hervi",
    num: "02",
    startTime: 8.0,
    endTime: 12.0,
    title: "2. Herví 8-10 min",
    subtitle: "Regeneración homogénea en agua",
    desc: "El baño maría mantiene los 100°C de forma envolvente sin resecar ni quemar. Todos los nutrientes, aromas y reducciones se recirculan dentro del vacío.",
    tip: "Cero salpicaduras ni olor a fritura en tu casa",
    icon: <Flame size={24} className="text-[#8F9E4B]" />,
  },
  {
    id: "servi",
    num: "03",
    startTime: 12.0,
    endTime: 19.5,
    title: "3. Abrí y disfrutá",
    subtitle: "Vapor y aromas de recién hecho",
    desc: "Retirá la bolsa por el borde superior (no quema), cortá con tijera y volcá directo al plato. Verás salir una nube de vapor fragante con el brillo de comida recién hecha.",
    tip: "Lavás un solo plato y un tenedor. Fin.",
    icon: <ScissorsCutIcon size={24} className="text-[#8F9E4B]" />,
  },
];

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [videoTime, setVideoTime] = useState(2.0);

  const isSeekingRef = useRef(false);
  const targetTimeRef = useRef(2.0);

  // Smooth video seeker
  const seekVideoTo = useCallback((time: number) => {
    targetTimeRef.current = time;
    if (!videoRef.current) return;
    if (!isSeekingRef.current) {
      if (Math.abs(videoRef.current.currentTime - time) > 0.06) {
        isSeekingRef.current = true;
        videoRef.current.currentTime = time;
      }
    }
  }, []);

  const handleSeeked = useCallback(() => {
    isSeekingRef.current = false;
    if (
      videoRef.current &&
      Math.abs(videoRef.current.currentTime - targetTimeRef.current) > 0.06
    ) {
      isSeekingRef.current = true;
      videoRef.current.currentTime = targetTimeRef.current;
    }
  }, []);

  // Track scroll position through the tall sticky container
  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;

      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.min(1, Math.max(0, currentScroll / totalScrollable));

      setScrollProgress(progress);

      // Map progress to video timeline:
      // 0.00 to 0.16 -> Hero title view (video holds at 2.0s)
      // 0.16 to 0.44 -> Step 1 (Sumergí): video 2.0s -> 8.0s
      // 0.44 to 0.72 -> Step 2 (Herví): video 8.0s -> 12.0s
      // 0.72 to 1.00 -> Step 3 (Serví): video 12.0s -> 19.5s
      let calculatedTime = 2.0;
      let currentStep: number | null = null;

      if (progress < 0.16) {
        calculatedTime = 2.0;
        currentStep = null; // showing hero title
      } else if (progress < 0.44) {
        const local = (progress - 0.16) / (0.44 - 0.16);
        calculatedTime = 2.0 + local * (8.0 - 2.0);
        currentStep = 0;
      } else if (progress < 0.72) {
        const local = (progress - 0.44) / (0.72 - 0.44);
        calculatedTime = 8.0 + local * (12.0 - 8.0);
        currentStep = 1;
      } else {
        const local = (progress - 0.72) / (1.00 - 0.72);
        calculatedTime = 12.0 + local * (19.5 - 12.0);
        currentStep = 2;
      }

      setVideoTime(calculatedTime);
      setActiveStepIndex(currentStep);
      seekVideoTo(calculatedTime);
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll(); // initialize

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [seekVideoTo]);

  // Jump smoothly to a specific step when clicked
  const handleStepClick = (index: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY + rect.top;
    const totalScrollable = rect.height - window.innerHeight;

    // Target scroll points:
    // Step 0: progress = 0.28
    // Step 1: progress = 0.56
    // Step 2: progress = 0.84
    const targetProgress = index === 0 ? 0.28 : index === 1 ? 0.56 : 0.84;
    const targetY = scrollTop + targetProgress * totalScrollable;

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  };

  // Calculate individual progress for each of the 3 segment bars
  // Step 1: 2s to 8s
  const step1Fill =
    videoTime <= 2.0 ? 0 : videoTime >= 8.0 ? 100 : ((videoTime - 2.0) / (8.0 - 2.0)) * 100;

  // Step 2: 8s to 12s
  const step2Fill =
    videoTime <= 8.0 ? 0 : videoTime >= 12.0 ? 100 : ((videoTime - 8.0) / (12.0 - 8.0)) * 100;

  // Step 3: 12s to 19.5s
  const step3Fill =
    videoTime <= 12.0 ? 0 : videoTime >= 19.5 ? 100 : ((videoTime - 12.0) / (19.5 - 12.0)) * 100;

  const fills = [step1Fill, step2Fill, step3Fill];

  // Hero title opacity fades out as user scrolls past 0.14
  const heroContentOpacity = Math.max(0, 1 - scrollProgress / 0.16);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380vh] sm:h-[420vh] bg-[#222421]"
    >
      {/* Sticky Fullscreen Video Canvas */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* HTML5 Video element scrubbing directly on scroll */}
        <video
          ref={videoRef}
          src="/videos/aa.mp4"
          muted
          playsInline
          preload="auto"
          onSeeked={handleSeeked}
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.85] contrast-[1.08] transition-all duration-300"
        />

        {/* Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#222421]/75 via-[#222421]/30 to-[#222421]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8F9E4B]/15 via-transparent to-[#222421]/50 pointer-events-none" />

        {/* 1. Initial Hero Content View (Visible at scrollProgress < 0.16) */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center px-5 sm:px-6 text-center pointer-events-none pt-24 pb-28"
          style={{
            opacity: heroContentOpacity,
            transform: `translateY(${-scrollProgress * 120}px)`,
            display: heroContentOpacity <= 0.01 ? "none" : "flex",
          }}
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Brand Display Title */}
            <div className="mb-3 sm:mb-4">
              <span className="block font-script text-5xl sm:text-7xl md:text-8xl text-[#FFFDF2] drop-shadow-md -rotate-2 mb-1">
                abrí y serví
              </span>
              <h1 className="font-heading font-black text-2xl sm:text-4xl md:text-6xl text-[#FFFDF2] uppercase tracking-tight leading-snug sm:leading-[1.08] text-balance">
                De la olla al plato en 8 minutos.
              </h1>
            </div>

            {/* Descriptor */}
            <p className="font-sans text-xs sm:text-lg text-[#FFFDF2]/90 font-normal max-w-xl text-balance mb-6 sm:mb-8 leading-relaxed">
              Cocinamos con recetas tradicionales de familia y sellamos al vacío para capturar
              todo el jugo y aroma. Herví la bolsa cerrada 8 a 10 minutos y sentate a comer
              sin ensuciar una sola olla.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6 sm:mb-8 w-full sm:w-auto pointer-events-auto">
              <a
                href="#platos-estrella"
                className="w-full sm:w-auto px-7 py-3 sm:py-3.5 rounded-full bg-[#8F9E4B] text-[#FFFDF2] font-heading font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:bg-[#7D8B3F] active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Ver Platos Estrella</span>
                <ArrowDown size={15} className="group-hover:translate-y-0.5 transition-transform" />
              </a>

              <button
                type="button"
                onClick={() => handleStepClick(0)}
                className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-full bg-[#FFFDF2]/20 backdrop-blur-md border border-[#FFFDF2]/40 text-[#FFFDF2] font-heading font-bold text-xs sm:text-sm tracking-wider uppercase hover:bg-[#FFFDF2]/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Flame size={15} className="text-[#8F9E4B]" />
                <span>Ver el paso a paso</span>
              </button>
            </div>

            {/* Mobile Quality Badges */}
            <div className="sm:hidden inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#222421]/60 backdrop-blur-sm border border-[#FFFDF2]/20 text-[10px] font-heading font-bold uppercase tracking-wider text-[#FFFDF2]/90">
              <span>8-10 min</span>
              <span className="text-[#8F9E4B]">•</span>
              <span>0% Conservantes</span>
              <span className="text-[#8F9E4B]">•</span>
              <span>0-4°C / -18°C</span>
            </div>

            {/* Desktop Quality Badges */}
            <div className="hidden sm:grid grid-cols-3 gap-6 max-w-2xl w-full border-t border-[#FFFDF2]/20 pt-6 text-[#FFFDF2]">
              <div className="flex flex-col items-center">
                <span className="font-heading font-black text-xl sm:text-2xl text-[#FFFDF2]">8-10 min</span>
                <span className="text-xs text-[#FFFDF2]/75 uppercase font-medium mt-0.5 font-heading">
                  Baño maría veloz
                </span>
              </div>
              <div className="flex flex-col items-center border-x border-[#FFFDF2]/20 px-2">
                <span className="font-heading font-black text-xl sm:text-2xl text-[#FFFDF2]">0% Conservantes</span>
                <span className="text-xs text-[#FFFDF2]/75 uppercase font-medium mt-0.5 font-heading">
                  Vacío como guardián
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-heading font-black text-xl sm:text-2xl text-[#FFFDF2]">0-4°C / -18°C</span>
                <span className="text-xs text-[#FFFDF2]/75 uppercase font-medium mt-0.5 font-heading">
                  Heladera o freezer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Floating Step Cards (Visible while scrolling past hero) */}
        {activeStepIndex !== null && (
          <div
            id="metodo"
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center sm:justify-start px-5 sm:px-12 lg:px-20"
          >
            <div className="w-full max-w-md bg-[#222421]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#FFFDF2]/20 text-[#FFFDF2] shadow-2xl pointer-events-auto animate-in fade-in zoom-in-95 duration-300">
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#8F9E4B] text-[#FFFDF2] text-xs font-heading font-black uppercase tracking-widest shadow-xs">
                  PASO {STEPS[activeStepIndex].num}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#FFFDF2]/10 border border-[#FFFDF2]/20 flex items-center justify-center">
                  {STEPS[activeStepIndex].icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#FFFDF2] mb-1">
                {STEPS[activeStepIndex].title}
              </h3>
              <p className="text-xs uppercase font-heading font-bold text-[#8F9E4B] tracking-wider mb-3">
                {STEPS[activeStepIndex].subtitle}
              </p>

              {/* Description */}
              <p className="font-sans text-xs sm:text-sm text-[#FFFDF2]/85 leading-relaxed mb-4">
                {STEPS[activeStepIndex].desc}
              </p>

              {/* Tip Pill */}
              <div className="pt-3 border-t border-[#FFFDF2]/15 flex items-center gap-2 text-xs text-[#FFFDF2]/90 font-medium">
                <CheckCircle2 size={14} className="text-[#8F9E4B] shrink-0" />
                <span>{STEPS[activeStepIndex].tip}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Bottom Video Scrubbing Progress Bar Navigation */}
        <div className="absolute bottom-5 sm:bottom-8 left-0 right-0 z-30 px-4 sm:px-8 flex justify-center pointer-events-none">
          <div className="w-full max-w-2xl flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-2xl sm:rounded-full bg-[#222421]/85 backdrop-blur-md border border-[#FFFDF2]/25 shadow-2xl pointer-events-auto">
            {STEPS.map((step, idx) => {
              const fill = fills[idx];
              const isCurrent = activeStepIndex === idx;

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(idx)}
                  className="group relative flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-full overflow-hidden text-center transition-all cursor-pointer select-none"
                  title={`Ir al paso ${step.num}: ${step.title}`}
                >
                  {/* Empty track */}
                  <div className="absolute inset-0 bg-[#FFFDF2]/10 rounded-xl sm:rounded-full" />

                  {/* Progress Fill bar matching video playback */}
                  <div
                    className="absolute inset-y-0 left-0 bg-[#8F9E4B] rounded-xl sm:rounded-full transition-all duration-100 ease-linear shadow-xs"
                    style={{ width: `${fill}%` }}
                  />

                  {/* Text Label */}
                  <span
                    className={`relative z-10 block text-[10px] sm:text-xs font-heading font-black uppercase tracking-wider truncate transition-colors ${
                      isCurrent
                        ? "text-[#FFFDF2] drop-shadow-md"
                        : fill > 0
                        ? "text-[#FFFDF2]"
                        : "text-[#FFFDF2]/65 group-hover:text-[#FFFDF2]"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
