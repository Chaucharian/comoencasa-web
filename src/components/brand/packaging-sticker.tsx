"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { BrandIsotypeSvg, PotBoilingIcon, SparkleCluster } from "./brand-icons";
import type { Dish } from "@/lib/types";

interface PackagingStickerProps {
  dish: Dish;
  size?: number;
  interactive?: boolean;
  className?: string;
  onQrClick?: () => void;
}

export function PackagingSticker({
  dish,
  size = 320,
  interactive = true,
  className = "",
  onQrClick,
}: PackagingStickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const weight = dish.weight || "450g";
  const regenTime = dish.regenTime || "8-10 min";
  const dishTitle = dish.name.toUpperCase();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Moderate tilt angles for tactile realism
    setRotation({
      x: (-y / rect.height) * 16,
      y: (x / rect.width) * 16,
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none transition-transform duration-200 ease-out ${className}`}
      style={{
        width: size,
        height: size,
        perspective: 1000,
      }}
    >
      {/* Outer physical sticker badge */}
      <div
        className="w-full h-full rounded-full relative overflow-hidden flex flex-col items-center justify-between p-4 shadow-xl border-4 border-[#FFFDF2]/40"
        style={{
          backgroundColor: "#8F9E4B",
          transform: interactive
            ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.02 : 1})`
            : "none",
          transformStyle: "preserve-3d",
          boxShadow: isHovered
            ? "0 24px 38px -10px rgba(34, 36, 33, 0.35), 0 0 0 1px rgba(255, 253, 242, 0.4)"
            : "0 14px 24px -8px rgba(34, 36, 33, 0.22)",
        }}
      >
        {/* Subtle circular foil sheen overlay */}
        <div className="absolute inset-0 rounded-full sticker-sheen pointer-events-none z-10" />

        {/* Die-cut outer ring perforation */}
        <div className="absolute inset-2 rounded-full border border-dashed border-[#FFFDF2]/30 pointer-events-none" />

        {/* SVG curved text for Upper & Lower Arcs */}
        <svg
          viewBox="0 0 320 320"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <defs>
            {/* Top arc path curving upwards from left to right */}
            <path
              id="topArcPath"
              d="M 46,145 A 114,114 0 0,1 274,145"
              fill="none"
            />
            {/* Bottom arc path curving downwards from left to right */}
            <path
              id="bottomArcPath"
              d="M 46,175 A 114,114 0 0,0 274,175"
              fill="none"
            />
          </defs>

          {/* Upper Arc Text: PESO NETO • 100% CASERO */}
          <text
            fill="#FFFDF2"
            fontSize="9"
            fontWeight="700"
            letterSpacing="0.14em"
            className="font-heading"
          >
            <textPath
              href="#topArcPath"
              startOffset="50%"
              textAnchor="middle"
            >
              PESO NETO: {weight} • 100% CASERO • SIN CONSERVANTES
            </textPath>
          </text>

          {/* Lower Arc Text: Conservar en frío... */}
          <text
            fill="#FFFDF2"
            fontSize="7.5"
            fontWeight="600"
            letterSpacing="0.06em"
            opacity="0.9"
            className="font-sans"
          >
            <textPath
              href="#bottomArcPath"
              startOffset="50%"
              textAnchor="middle"
            >
              CONSERVAR EN FRÍO (0-4°C) O FREEZER (-18°C) • VTO: LOTE FRESCO
            </textPath>
          </text>
        </svg>

        {/* Central Top: Brand Logo / Imagotipo */}
        <div className="relative z-10 pt-2 flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5">
            <span className="font-script text-xl text-[#FFFDF2] tracking-wide leading-none drop-shadow-sm">
              abrí
            </span>
            <span className="font-script text-base text-[#FFFDF2]/90 leading-none">
              y
            </span>
            <span className="font-script text-xl text-[#FFFDF2] tracking-wide leading-none drop-shadow-sm">
              serví
            </span>
            <SparkleCluster className="scale-60 ml-0.5" />
          </div>

          {/* Central Isotype SVG illustration */}
          <BrandIsotypeSvg size={30} className="text-[#FFFDF2] my-0.5 opacity-90" />

          <span className="text-[8.5px] uppercase tracking-wider text-[#FFFDF2]/90 font-medium font-heading">
            Comida casera al vacío
          </span>
        </div>

        {/* Central Cartela Blanca (Pill Container) */}
        <div className="relative z-10 w-[92%] my-auto">
          <div className="bg-[#FFFFFF] rounded-[4px] px-2.5 py-1.5 shadow-md border border-[#222421]/10 text-center">
            <h4
              className="text-[#222421] font-heading font-black text-xs sm:text-sm tracking-wide leading-snug uppercase line-clamp-2"
              title={dishTitle}
            >
              {dishTitle}
            </h4>
          </div>
        </div>

        {/* Bottom Operational Sector: Regeneration & QR */}
        <div className="relative z-10 pb-5 w-[86%] grid grid-cols-[1fr_auto] items-center gap-2">
          {/* Instructions Column */}
          <div className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 rounded-full bg-[#FFFDF2]/20 border border-[#FFFDF2]/40 flex items-center justify-center shrink-0 text-[#FFFDF2]">
              <PotBoilingIcon size={17} />
            </div>
            <div className="leading-tight text-[#FFFDF2]">
              <p className="text-[8.5px] font-medium leading-none opacity-90 font-sans">
                Herví sin abrir
              </p>
              <p className="text-[12px] font-black font-heading tracking-wide">
                {regenTime}
              </p>
              <p className="text-[8px] font-bold tracking-tight opacity-95">
                ¡Abrí y serví!
              </p>
            </div>
          </div>

          {/* QR Code Column */}
          <div
            onClick={onQrClick}
            className={`flex flex-col items-center bg-[#FFFFFF] p-1 rounded-[3px] shadow border border-[#222421]/15 cursor-pointer hover:scale-105 transition-transform ${
              onQrClick ? "cursor-pointer" : ""
            }`}
            title="Escanear para ver menú y regeneración"
          >
            {/* Realistic Crisp Vector QR Code */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 29 29"
              fill="none"
              className="shrink-0"
            >
              {/* Corner 1 */}
              <rect x="0" y="0" width="7" height="7" fill="#222421" />
              <rect x="1" y="1" width="5" height="5" fill="#FFFFFF" />
              <rect x="2" y="2" width="3" height="3" fill="#222421" />
              {/* Corner 2 */}
              <rect x="22" y="0" width="7" height="7" fill="#222421" />
              <rect x="23" y="1" width="5" height="5" fill="#FFFFFF" />
              <rect x="24" y="2" width="3" height="3" fill="#222421" />
              {/* Corner 3 */}
              <rect x="0" y="22" width="7" height="7" fill="#222421" />
              <rect x="1" y="23" width="5" height="5" fill="#FFFFFF" />
              <rect x="2" y="24" width="3" height="3" fill="#222421" />
              {/* Timing & Data Matrix bits */}
              <rect x="9" y="2" width="2" height="2" fill="#222421" />
              <rect x="13" y="1" width="3" height="2" fill="#222421" />
              <rect x="18" y="2" width="2" height="2" fill="#222421" />
              <rect x="9" y="5" width="2" height="2" fill="#222421" />
              <rect x="15" y="5" width="2" height="2" fill="#222421" />
              {/* Middle block */}
              <rect x="11" y="11" width="7" height="7" fill="#222421" />
              <rect x="13" y="13" width="3" height="3" fill="#8F9E4B" />
              {/* More bits */}
              <rect x="3" y="9" width="3" height="2" fill="#222421" />
              <rect x="24" y="9" width="3" height="2" fill="#222421" />
              <rect x="1" y="13" width="2" height="3" fill="#222421" />
              <rect x="26" y="13" width="2" height="3" fill="#222421" />
              <rect x="9" y="23" width="3" height="2" fill="#222421" />
              <rect x="15" y="21" width="4" height="2" fill="#222421" />
              <rect x="13" y="25" width="2" height="3" fill="#222421" />
              <rect x="21" y="23" width="3" height="3" fill="#222421" />
            </svg>
            <span className="text-[5.5px] font-bold text-[#222421] uppercase tracking-tighter leading-none mt-0.5">
              SCAN MENÚ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
