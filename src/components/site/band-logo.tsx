"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BAND_LOGO_PATH, BAND_LOGO_VIEWBOX } from "@/components/site/band-logo-paths";
import { cn } from "@/lib/utils";

type BandLogoProps = {
  className?: string;
  animated?: boolean;
  looping?: boolean;
  glow?: boolean;
};

const { width, height } = BAND_LOGO_VIEWBOX;
const CYCLE = 3.2;

export function BandLogo({
  className,
  animated = false,
  looping = false,
  glow = true,
}: BandLogoProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const reduce = useReducedMotion();
  const play = animated && !reduce;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      role="img"
      aria-label="CISNE ELOCUENTE"
      className={cn(
        "overflow-visible",
        glow && "[filter:drop-shadow(0_0_22px_rgba(209,18,26,0.38))]",
        className,
      )}
    >
      <defs>
        <mask
          id={`${uid}-rise`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={width}
          height={height}
        >
          <motion.rect
            x="0"
            width={width}
            fill="#fff"
            initial={play ? { y: height, height: 0 } : false}
            animate={
              play && looping
                ? {
                    y: [height, height, 0, 0],
                    height: [0, 0, height, height],
                  }
                : { y: 0, height }
            }
            transition={
              play && looping
                ? {
                    duration: CYCLE,
                    times: [0, 0.26, 0.72, 1],
                    repeat: Infinity,
                    ease: [0.22, 1, 0.36, 1],
                  }
                : {
                    duration: play ? 1.55 : 0,
                    delay: play ? 0.85 : 0,
                    ease: [0.22, 1, 0.36, 1],
                  }
            }
          />
        </mask>
      </defs>

      <motion.path
        d={BAND_LOGO_PATH}
        fill="none"
        stroke="#f5f5f5"
        strokeWidth={play ? 3.2 : 0}
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
        initial={play ? { strokeDashoffset: 1, opacity: 0.25 } : false}
        animate={
          play && looping
            ? { strokeDashoffset: [1, 0, 0], opacity: 1 }
            : { strokeDashoffset: 0, opacity: 1 }
        }
        transition={
          play && looping
            ? {
                duration: CYCLE,
                times: [0, 0.5, 1],
                repeat: Infinity,
                ease: [0.4, 0, 0.2, 1],
              }
            : { duration: 1.7, ease: [0.4, 0, 0.2, 1] }
        }
        style={{ strokeDasharray: 1 }}
      />

      <g mask={`url(#${uid}-rise)`}>
        <image
          href="/brand/cisne-elocuente.png?v=3"
          width={width}
          height={height}
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    </svg>
  );
}
