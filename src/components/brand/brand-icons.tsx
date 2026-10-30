import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * Ícono: Olla al fuego (Baño maría / ebullición de bolsa)
 * Trazo constante 1.5pt, esquinas y bordes redondeados
 */
export function PotBoilingIcon({ className = "", size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Vapor */}
      <path d="M8 3c-.5 1 .5 2 0 3" />
      <path d="M12 2c-.5 1 .5 2 0 3" />
      <path d="M16 3c-.5 1 .5 2 0 3" />
      {/* Olla */}
      <path d="M4 9h16v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9z" />
      {/* Asas */}
      <path d="M4 11H2a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h2" />
      <path d="M20 11h2a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-2" />
      {/* Línea de nivel de agua */}
      <path d="M7 13c1.5-.5 3 .5 4.5 0s3-.5 5 0" strokeDasharray="1.5 2" />
    </svg>
  );
}

/**
 * Ícono: Tijera / Corte (Apertura segura del pack)
 */
export function ScissorsCutIcon({ className = "", size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
      {/* Línea de corte punteada */}
      <line x1="17" y1="2" x2="17" y2="8" strokeDasharray="2 2" />
    </svg>
  );
}

/**
 * Ícono: Plato y cubierto (Servir y disfrutar)
 */
export function PlateServeIcon({ className = "", size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Plato base */}
      <ellipse cx="12" cy="17" rx="9" ry="4" />
      <ellipse cx="12" cy="16" rx="6" ry="2.2" />
      {/* Vapor wafting */}
      <path d="M9 10c-.8-1.5.8-2.5 0-4" />
      <path d="M12 9c-.8-1.5.8-2.5 0-4" />
      <path d="M15 10c-.8-1.5.8-2.5 0-4" />
    </svg>
  );
}

/**
 * Ícono: Copo de nieve / Termómetro (Conservación 0-4°C y -18°C)
 */
export function ColdStorageIcon({ className = "", size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="3.34" y1="7" x2="20.66" y2="17" />
      <line x1="3.34" y1="17" x2="20.66" y2="7" />
      <polyline points="10 4 12 2 14 4" />
      <polyline points="10 20 12 22 14 20" />
      <polyline points="4.5 9 3.34 7 5.5 5.5" />
      <polyline points="19.5 18.5 20.66 17 18.5 15" />
      <polyline points="4.5 15 3.34 17 5.5 18.5" />
      <polyline points="19.5 5.5 20.66 7 18.5 9" />
    </svg>
  );
}

/**
 * Ícono: Horno / Microondas (Gratinado o regeneración de tartas)
 */
export function OvenIcon({ className = "", size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <rect x="5" y="8" width="14" height="9" rx="1" />
      <circle cx="7" cy="6" r="0.8" fill="currentColor" />
      <circle cx="10" cy="6" r="0.8" fill="currentColor" />
      <circle cx="13" cy="6" r="0.8" fill="currentColor" />
    </svg>
  );
}

/**
 * Destellos decorativos (Estrellas de 4 puntas de trazo fino)
 * Denotan frescura y calidez culinaria
 */
export function SparkleStar({ className = "", size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
    </svg>
  );
}

/**
 * Grupo de 3 destellos decorativos como especifica el manual
 */
export function SparkleCluster({ className = "" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center pointer-events-none ${className}`}>
      <SparkleStar size={16} className="text-[#FFFDF2]/90 animate-pulse" />
      <SparkleStar size={9} className="text-[#FFFDF2]/60 absolute -top-2 -right-2" />
      <SparkleStar size={7} className="text-[#FFFDF2]/50 absolute -bottom-1 -left-2" />
    </div>
  );
}

/**
 * Isotipo SVG vectorial estilizado:
 * Bolsa sellada al vacío que desprende vapor hacia plato hondo con comida y cuchara
 */
export function BrandIsotypeSvg({ className = "", size = 48 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bolsa al vacío izquierda inclinada */}
      <path
        d="M12 18 L28 10 L38 34 L22 42 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Pliegues / estrías de vacío en la bolsa */}
      <path d="M18 24 L30 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20 30 L32 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      
      {/* Vapor wafting hacia el plato */}
      <path
        d="M31 16 C36 12 40 22 46 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M35 22 C40 18 43 28 50 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Plato hondo a la derecha */}
      <ellipse
        cx="58"
        cy="40"
        rx="18"
        ry="6"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Comida en el plato */}
      <path
        d="M45 38 C47 33 53 31 58 31 C63 31 69 33 71 38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* Cuchara apoyada */}
      <path
        d="M70 28 L74 22 C76 20 78 22 76 24 L72 30"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
