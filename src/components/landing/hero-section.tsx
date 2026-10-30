"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowDown, Flame, Timer, ShieldCheck, Snowflake } from "lucide-react";

interface StepInfo {
  id: string;
  num: string;
  startTime: number;
  endTime: number;
  tag: string;
  shortLabel: string;
  title: string;
  desc: string;
}

const STEPS: StepInfo[] = [
  {
    id: "sumergi",
    num: "01",
    startTime: 2.0,
    endTime: 8.0,
    tag: "100°C · Sin abrir",
    shortLabel: "1. Sumergí",
    title: "1. Sumergí el pack",
    desc: "Directo en agua hirviendo. Se regenera en su propio jugo sin perder humedad ni sabor.",
  },
  {
    id: "hervi",
    num: "02",
    startTime: 8.0,
    endTime: 12.0,
    tag: "8 a 10 min",
    shortLabel: "2. Herví",
    title: "2. Herví a fuego medio",
    desc: "El baño maría mantiene los jugos intactos. Cero salpicaduras ni olor en tu cocina.",
  },
  {
    id: "servi",
    num: "03",
    startTime: 12.0,
    endTime: 19.5,
    tag: "Al plato",
    shortLabel: "3. Serví",
    title: "3. Abrí y disfrutá",
    desc: "Cortá la esquina y serví directo. Nube de vapor fragante y textura de recién cocinado.",
  },
];

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [videoTime, setVideoTime] = useState(2.0);

  const scrollProgressRef = useRef(0);
  const targetTimeRef = useRef(2.0);

  // Time handoff and step playback refs
  const heroTimeRef = useRef(2.0);
  const handoffTimeRef = useRef<number | null>(null);
  const handoffScrollYRef = useRef<number>(0);
  const isPlayingStepRef = useRef(false);
  const selectedStepIdxRef = useRef<number | null>(null);

  // Helper to resolve active step from a timestamp
  const getStepFromTime = useCallback((time: number): number => {
    if (time < 8.0) return 0;
    if (time < 12.0) return 1;
    return 2;
  }, []);

  // Dedicated RAF animation loop: plays video smoothly toward target time instead of jittery seeking
  useEffect(() => {
    let rafId: number;

    const tick = () => {
      const video = videoRef.current;
      if (!video) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      // 1. Initial Hero Loop (progress < 0.02)
      if (scrollProgressRef.current < 0.02) {
        handoffTimeRef.current = null;
        isPlayingStepRef.current = false;

        if (video.playbackRate !== 1.0) {
          video.playbackRate = 1.0;
        }
        if (video.paused) {
          video.play().catch(() => { });
        }
        // Continuous loop between 2.0s and 19.5s
        if (video.currentTime >= 19.5 || video.currentTime < 2.0) {
          video.currentTime = 2.0;
        }
        heroTimeRef.current = video.currentTime;
        setVideoTime(video.currentTime);
        rafId = requestAnimationFrame(tick);
        return;
      }

      // 2. User clicked a step: play continuously from that step timestamp!
      if (isPlayingStepRef.current) {
        if (video.playbackRate !== 1.0) {
          video.playbackRate = 1.0;
        }
        if (video.paused) {
          video.play().catch(() => { });
        }
        const currentTime = video.currentTime;
        setVideoTime(currentTime);

        // Keep active step indicator in sync with current playback time
        setActiveStepIndex(getStepFromTime(currentTime));

        // When reaching end of cycle, loop back to 2.0s
        if (currentTime >= 19.5 || currentTime < 2.0) {
          video.currentTime = 2.0;
        }

        rafId = requestAnimationFrame(tick);
        return;
      }

      // 3. User is actively driving video with scroll:
      const target = targetTimeRef.current;
      const current = video.currentTime;
      const diff = target - current;

      if (diff > 0.08) {
        // Target is ahead: play fluidly forward toward target!
        const rate = Math.min(2.8, Math.max(0.85, diff * 1.5));
        if (Math.abs(video.playbackRate - rate) > 0.05) {
          video.playbackRate = rate;
        }
        if (video.paused) {
          video.play().catch(() => { });
        }
        setVideoTime(video.currentTime);
      } else if (diff < -0.08) {
        // Target is behind: interpolate backward smoothly
        if (!video.paused) {
          video.pause();
        }
        const step = diff * 0.22;
        const nextTime = Math.max(2.0, current + step);
        try {
          video.currentTime = nextTime;
        } catch {
          // Ignore
        }
        setVideoTime(nextTime);
      } else {
        // Reached target within margin: pause and hold
        if (!video.paused) {
          video.pause();
        }
        setVideoTime(current);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // When metadata loads, cue to 2.0s and ensure autoplay if at the top
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 2.0;
      if (scrollProgressRef.current < 0.02) {
        videoRef.current.play().catch(() => { });
      }
    }
  }, []);

  // Sync video time while playing in hero loop
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    if (scrollProgressRef.current < 0.02) {
      if (videoRef.current.currentTime >= 19.5 || videoRef.current.currentTime < 2.0) {
        videoRef.current.currentTime = 2.0;
      }
      heroTimeRef.current = videoRef.current.currentTime;
      setVideoTime(videoRef.current.currentTime);
    }
  }, []);

  // Ensure video starts playing on mount if in hero
  useEffect(() => {
    if (videoRef.current && window.scrollY < 40) {
      videoRef.current.currentTime = 2.0;
      videoRef.current.play().catch(() => { });
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

      scrollProgressRef.current = progress;
      setScrollProgress(progress);

      const isHeroMode = progress < 0.02;

      if (isHeroMode) {
        handoffTimeRef.current = null;
        isPlayingStepRef.current = false;
        setActiveStepIndex(null);
      } else {
        // If user is actively playing a step, don't interrupt it with programmatic scroll events!
        if (isPlayingStepRef.current) {
          return;
        }

        // Natural handoff: capture the exact second the user was watching in the hero!
        if (handoffTimeRef.current === null) {
          const captured = videoRef.current ? videoRef.current.currentTime : heroTimeRef.current;
          handoffTimeRef.current = Math.min(19.5, Math.max(2.0, captured));
          handoffScrollYRef.current = window.scrollY;
        }

        const baseTime = handoffTimeRef.current;
        const deltaScroll = Math.max(0, window.scrollY - handoffScrollYRef.current);

        // Rate: calculate how fast scroll advances remaining time
        const remainingTime = Math.max(3.0, 19.5 - baseTime);
        const scrollPerSec = Math.max(70, (totalScrollable * 0.75) / remainingTime);
        const calculatedTime = Math.min(19.5, Math.max(2.0, baseTime + deltaScroll / scrollPerSec));

        targetTimeRef.current = calculatedTime;
        setActiveStepIndex(getStepFromTime(calculatedTime));
      }
    };

    const handleUserGesture = () => {
      // Physical user interaction returns video control back to scroll scrubbing
      isPlayingStepRef.current = false;
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", handleUserGesture, { passive: true });
    window.addEventListener("touchstart", handleUserGesture, { passive: true });
    window.addEventListener("touchmove", handleUserGesture, { passive: true });
    handleScroll(); // initialize

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", handleUserGesture);
      window.removeEventListener("touchstart", handleUserGesture);
      window.removeEventListener("touchmove", handleUserGesture);
      cancelAnimationFrame(animationFrameId);
    };
  }, [getStepFromTime]);

  // Jump smoothly to a specific step when clicked:
  // Cues to step start and PLAYS continuously so the user can watch the action
  const handleStepClick = (index: number) => {
    const step = STEPS[index];
    const video = videoRef.current;

    setActiveStepIndex(index);
    selectedStepIdxRef.current = index;
    isPlayingStepRef.current = true;
    targetTimeRef.current = step.startTime;

    // Synchronize handoff time to this step
    handoffTimeRef.current = step.startTime;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY + rect.top;
      const totalScrollable = rect.height - window.innerHeight;
      const targetProgress = index === 0 ? 0.06 : index === 1 ? 0.45 : 0.80;
      handoffScrollYRef.current = scrollTop + targetProgress * totalScrollable;

      window.scrollTo({
        top: handoffScrollYRef.current,
        behavior: "smooth",
      });
    }

    if (video) {
      video.currentTime = step.startTime;
      setVideoTime(step.startTime);
      video.playbackRate = 1.0;
      video.play().catch(() => { });
    }
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

  // Hero title opacity fades out immediately as user swipes down
  const heroContentOpacity = Math.max(0, 1 - scrollProgress / 0.03);

  // Top logo remains visible through all 3 steps, fading out only when approaching platos-estrella
  const topLogoOpacity = scrollProgress < 0.92 ? 1 : Math.max(0, (1 - scrollProgress) / 0.08);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[360vh] sm:h-[650vh] bg-[#222421]"
    >
      {/* Sticky Fullscreen Video Canvas: covers the entire physical screen including top & bottom notch */}
      <div
        className="sticky top-0 w-full overflow-hidden flex items-center justify-center h-screen h-[100dvh]"
        style={{
          height: "100dvh",
          minHeight: "100dvh",
        }}
      >
        {/* HTML5 Video element: auto-loops in hero, scrubs on scroll */}
        <video
          ref={videoRef}
          src="/videos/aa.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          {...({ "webkit-playsinline": "true", "x5-playsinline": "true" } as any)}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.92] contrast-[1.06] transition-all duration-300 pointer-events-none"
        />

        {/* Ambient Overlay: light in upper/middle so video is crystal clear, deeper at bottom where content sits */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            background:
              scrollProgress < 0.02
                ? "linear-gradient(to bottom, rgba(34,36,33,0.55) 0%, rgba(34,36,33,0.06) 30%, rgba(34,36,33,0.5) 60%, rgba(34,36,33,0.92) 85%, rgba(34,36,33,0.98) 100%)"
                : "linear-gradient(to bottom, rgba(34,36,33,0.55) 0%, rgba(34,36,33,0.06) 35%, rgba(34,36,33,0.1) 65%, rgba(34,36,33,0.75) 100%)",
          }}
        />

        {/* Floating Top Brand Logo - Stays visible in Hero and during Steps, only fades at platos-estrella */}
        <div
          className="absolute top-4 sm:top-6 md:top-8 inset-x-0 z-20 flex justify-center pointer-events-none transition-opacity duration-300"
          style={{
            opacity: topLogoOpacity,
            display: topLogoOpacity <= 0.01 ? "none" : "flex",
          }}
        >
          <Image
            src="/brand/logo-cream.png"
            alt="abrí y serví"
            width={360}
            height={280}
            priority
            className="h-16 sm:h-24 md:h-28 lg:h-32 w-auto object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.65)]"
          />
        </div>

        {/* 1. Initial Hero Content View - Anchored with dynamic safe-area-inset for all mobile screens */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center justify-end px-4 sm:px-6 text-center pointer-events-none pt-10"
          style={{
            opacity: heroContentOpacity,
            transform: `translateY(${-scrollProgress * 50}px)`,
            display: heroContentOpacity <= 0.01 ? "none" : "flex",
            paddingBottom: "max(2.25rem, calc(env(safe-area-inset-bottom, 24px) + 0.75rem))",
          }}
        >
          <div className="max-w-3xl mx-auto flex flex-col items-center w-full">
            {/* Main Claim: calibrated for perfect mobile vertical rhythm */}
            <h1 className="font-heading font-black text-xl sm:text-3xl md:text-5xl lg:text-6xl text-[#FFFDF2] uppercase tracking-tight leading-[1.1] text-balance mb-1.5 sm:mb-3">
              De la olla al plato en 8 minutos.
            </h1>

            {/* Direct & Simple Descriptor */}
            <p className="font-sans text-xs sm:text-base md:text-lg text-[#FFFDF2]/90 font-normal max-w-sm sm:max-w-lg text-balance mb-3 sm:mb-5 leading-normal sm:leading-relaxed">
              Comida casera envasada al vacío. Calentá en agua hirviendo y serví sin ensuciar una sola olla.
            </p>

            {/* Action Buttons: Strictly Horizontal on mobile & desktop */}
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 mb-2.5 sm:mb-4 w-full max-w-xs sm:max-w-md pointer-events-auto">
              <a
                href="#platos-estrella"
                className="flex-1 py-2.5 sm:py-3.5 px-3 sm:px-6 rounded-full bg-[#8F9E4B] text-[#FFFDF2] font-heading font-extrabold text-[11px] sm:text-sm tracking-wider uppercase shadow-xl hover:bg-[#7D8B3F] active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 group cursor-pointer whitespace-nowrap"
              >
                <span>Ver Platos</span>
                <ArrowDown size={14} className="group-hover:translate-y-0.5 transition-transform shrink-0" />
              </a>

              <button
                type="button"
                onClick={() => handleStepClick(0)}
                className="flex-1 py-2.5 sm:py-3.5 px-3 sm:px-5 rounded-full bg-[#FFFDF2]/15 backdrop-blur-md border border-[#FFFDF2]/30 text-[#FFFDF2] font-heading font-bold text-[11px] sm:text-sm tracking-wider uppercase hover:bg-[#FFFDF2]/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap"
              >
                <Flame size={14} className="text-[#8F9E4B] shrink-0" />
                <span>El Paso a Paso</span>
              </button>
            </div>

            {/* Full-width indicators strip: spans to the screen limits with no left/right borders */}
            <div className="w-screen -mx-4 sm:-mx-6 flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 bg-[#222421]/75 backdrop-blur-md border-y border-[#FFFDF2]/15 border-x-0 text-[#FFFDF2] shadow-md flex-nowrap whitespace-nowrap">
              <div className="inline-flex items-center gap-1">
                <Timer size={10} className="text-[#8F9E4B] shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-heading font-bold uppercase tracking-wider">
                  8-10 min
                </span>
              </div>

              <span className="text-[#FFFDF2]/25 text-[10px] select-none">•</span>

              <div className="inline-flex items-center gap-1">
                <ShieldCheck size={10} className="text-[#8F9E4B] shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-heading font-bold uppercase tracking-wider">
                  0% Conservantes
                </span>
              </div>

              <span className="text-[#FFFDF2]/25 text-[10px] select-none">•</span>

              <div className="inline-flex items-center gap-1">
                <Snowflake size={10} className="text-[#8F9E4B] shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-heading font-bold uppercase tracking-wider">
                  7d heladera · 3m freezer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Concentrated Interactive Stepper with Smooth Bezier Morphing Drawer */}
        {activeStepIndex !== null && (
          <div
            className="absolute left-0 right-0 z-30 px-3 sm:px-6 flex justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              bottom: "max(1.75rem, calc(env(safe-area-inset-bottom, 20px) + 0.5rem))",
            }}
          >
            <div className="w-full max-w-xl bg-[#222421]/80 backdrop-blur-xl border border-[#FFFDF2]/20 shadow-2xl rounded-3xl p-2 sm:p-2.5 pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col">
              {/* 1. Step Pills Row */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {STEPS.map((step, idx) => {
                  const fill = fills[idx];
                  const isCurrent = activeStepIndex === idx;

                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(idx)}
                      className={`group relative flex-1 py-2 sm:py-2.5 px-2 rounded-2xl overflow-hidden text-center transition-all duration-300 cursor-pointer select-none ${isCurrent
                        ? "ring-1 ring-[#8F9E4B]/60 shadow-md"
                        : "hover:bg-[#FFFDF2]/5"
                        }`}
                      title={`Ir al paso ${step.num}: ${step.title}`}
                    >
                      {/* Background empty track */}
                      <div
                        className={`absolute inset-0 rounded-2xl transition-colors duration-300 ${isCurrent ? "bg-[#8F9E4B]/20" : "bg-[#FFFDF2]/10"
                          }`}
                      />

                      {/* Progress Fill bar matching video playback */}
                      <div
                        className="absolute inset-y-0 left-0 bg-[#8F9E4B] rounded-2xl transition-all duration-100 ease-linear shadow-xs"
                        style={{ width: `${fill}%` }}
                      />

                      {/* Text Label: responsive to prevent ellipses on mobile */}
                      <span
                        className={`relative z-10 block text-[11px] sm:text-xs font-heading font-black uppercase tracking-wider truncate transition-colors duration-200 ${isCurrent || fill > 0
                          ? "text-[#FFFDF2] drop-shadow-sm"
                          : "text-[#FFFDF2]/65 group-hover:text-[#FFFDF2]"
                          }`}
                      >
                        <span className="sm:hidden">{step.shortLabel}</span>
                        <span className="hidden sm:inline">{step.title}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 2. Expanded Step Details with Smooth Bezier Morphing */}
              <div
                key={activeStepIndex}
                className="mt-2 pt-2 sm:mt-2.5 sm:pt-2.5 border-t border-[#FFFDF2]/10 px-2 sm:px-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8F9E4B] shrink-0 animate-pulse" />
                  <span className="text-[10px] font-heading font-black uppercase tracking-widest text-[#8F9E4B]">
                    PASO {STEPS[activeStepIndex].num}
                  </span>
                  <span className="text-[#FFFDF2]/30 text-[10px]">•</span>
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#FFFDF2]/70">
                    {STEPS[activeStepIndex].tag}
                  </span>
                </div>

                <p className="font-sans text-xs sm:text-[13px] text-[#FFFDF2]/90 leading-relaxed font-normal text-left sm:text-right">
                  {STEPS[activeStepIndex].desc}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

