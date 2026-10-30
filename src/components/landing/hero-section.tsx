"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, ArrowDown, Sparkles, Flame, Clock, ShieldCheck } from "lucide-react";
import { SparkleCluster, SparkleStar } from "@/components/brand/brand-icons";

const HERO_VIDEOS = [
  {
    id: "submerge",
    title: "1. Sumergir pack",
    src: "/videos/gemini_generated_video_3e849150.mp4",
    desc: "Bolsa sellada directo a la olla",
  },
  {
    id: "boil",
    title: "2. Hervir 8-10 min",
    src: "/videos/aa.mp4",
    desc: "Regeneración homogénea en agua",
  },
  {
    id: "serve",
    title: "3. Abrí y disfrutá",
    src: "/videos/gemini_generated_video_b554c19f.mp4",
    desc: "Vapor y aromas de recién hecho",
  },
];

export function HeroSection() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeVideo = HERO_VIDEOS[activeVideoIndex];

  const handleVideoSelect = (index: number) => {
    setActiveVideoIndex(index);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <section className="relative w-full min-h-[94vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Background Video Player */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#222421]">
        <video
          ref={videoRef}
          key={activeVideo.src}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.78] contrast-[1.08] transition-opacity duration-700"
        >
          <source src={activeVideo.src} type="video/mp4" />
        </video>

        {/* Cinematic Brand Gradient Overlays */}
        {/* Top to bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#222421]/80 via-[#222421]/45 to-[#222421]/90" />
        {/* Verde Oliva warm ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8F9E4B]/25 via-transparent to-[#222421]/60 pointer-events-none" />
      </div>

      {/* Floating decorative sparkles */}
      <div className="absolute top-28 left-8 sm:left-20 pointer-events-none z-10 opacity-70">
        <SparkleCluster className="scale-125" />
      </div>
      <div className="absolute top-44 right-8 sm:right-24 pointer-events-none z-10 opacity-60">
        <SparkleCluster className="scale-100" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        {/* Top Brand Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF2]/15 backdrop-blur-md border border-[#FFFDF2]/30 text-[#FFFDF2] text-[11px] sm:text-xs font-heading font-semibold uppercase tracking-widest mb-6 animate-pulse">
          <SparkleStar size={12} className="text-[#8F9E4B]" />
          <span>Comida casera envasada al vacío</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8F9E4B]" />
          <span>Mar del Plata</span>
        </div>

        {/* Primary Display Title */}
        <div className="mb-4">
          <span className="block font-script text-5xl sm:text-7xl md:text-8xl text-[#FFFDF2] drop-shadow-md -rotate-2 mb-1">
            abrí y serví
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-[#FFFDF2] uppercase tracking-tight leading-[1.08] max-w-4xl text-balance">
            De la olla al plato en 8 minutos.
          </h1>
        </div>

        {/* Descriptor / Value Proposition */}
        <p className="font-sans text-base sm:text-xl text-[#FFFDF2]/90 font-normal max-w-2xl text-balance mb-8 leading-relaxed">
          Cocinamos con recetas tradicionales de familia y sellamos al vacío para
          capturar todo el jugo y aroma. Herví la bolsa cerrada 8 a 10 minutos
          y disfrutá comida caliente sin lavar una sola olla.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 mb-12 w-full sm:w-auto">
          <a
            href="#platos-estrella"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#8F9E4B] text-[#FFFDF2] font-heading font-extrabold text-sm tracking-wider uppercase shadow-xl hover:bg-[#7D8B3F] hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Ver Platos Estrella</span>
            <ArrowDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
          </a>

          <a
            href="#metodo"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#FFFDF2]/20 backdrop-blur-md border border-[#FFFDF2]/40 text-[#FFFDF2] font-heading font-bold text-sm tracking-wider uppercase hover:bg-[#FFFDF2]/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Flame size={16} className="text-[#8F9E4B]" />
            <span>El Ritual de 3 Pasos</span>
          </a>
        </div>

        {/* Quality Badges Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-2xl w-full border-t border-[#FFFDF2]/20 pt-6 text-[#FFFDF2]">
          <div className="flex flex-col items-center">
            <span className="font-heading font-black text-xl sm:text-2xl text-[#FFFDF2]">8-10 min</span>
            <span className="text-[11px] sm:text-xs text-[#FFFDF2]/75 uppercase font-medium mt-0.5 font-heading">
              Baño maría veloz
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-[#FFFDF2]/20 px-2">
            <span className="font-heading font-black text-xl sm:text-2xl text-[#FFFDF2]">0% Conservantes</span>
            <span className="text-[11px] sm:text-xs text-[#FFFDF2]/75 uppercase font-medium mt-0.5 font-heading">
              Vacío como guardián
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-heading font-black text-xl sm:text-2xl text-[#FFFDF2]">0-4°C / -18°C</span>
            <span className="text-[11px] sm:text-xs text-[#FFFDF2]/75 uppercase font-medium mt-0.5 font-heading">
              Heladera o freezer
            </span>
          </div>
        </div>
      </div>

      {/* Video Controls Bar (Bottom Right & Center Switcher) */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
        {/* Left: Video angle playlist switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#222421]/60 backdrop-blur-md border border-[#FFFDF2]/20 pointer-events-auto shadow-lg">
          {HERO_VIDEOS.map((vid, idx) => (
            <button
              key={vid.id}
              onClick={() => handleVideoSelect(idx)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider transition-all ${
                activeVideoIndex === idx
                  ? "bg-[#8F9E4B] text-[#FFFDF2] shadow-sm"
                  : "text-[#FFFDF2]/70 hover:text-[#FFFDF2] hover:bg-[#FFFDF2]/10"
              }`}
            >
              {vid.title}
            </button>
          ))}
        </div>

        {/* Right: Play/Pause and Audio Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
            className="w-9 h-9 rounded-full bg-[#222421]/60 backdrop-blur-md border border-[#FFFDF2]/20 flex items-center justify-center text-[#FFFDF2] hover:bg-[#8F9E4B] hover:text-[#FFFDF2] transition-colors shadow-md"
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
          </button>
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Activar sonido" : "Silenciar video"}
            className="w-9 h-9 rounded-full bg-[#222421]/60 backdrop-blur-md border border-[#FFFDF2]/20 flex items-center justify-center text-[#FFFDF2] hover:bg-[#8F9E4B] hover:text-[#FFFDF2] transition-colors shadow-md"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>
    </section>
  );
}
