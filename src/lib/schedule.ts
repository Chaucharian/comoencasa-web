import type { Store, DeliveryShift } from "./types";

export interface ScheduleStatus {
  isOpen: boolean;
  canDeliver: boolean;
  statusText: string;
  reason?: string;
  currentArgentinaTime: string;
  nextOpening?: string;
}

/**
 * Parses time strings like "11:30", "15", "19:30", "22" into minutes from midnight (0..1439)
 */
function parseTimeToMinutes(str: string): number | null {
  if (!str) return null;
  const parts = str.trim().split(":");
  const h = parseInt(parts[0], 10);
  if (isNaN(h) || h < 0 || h > 24) return null;
  const m = parts.length > 1 ? parseInt(parts[1], 10) : 0;
  return h * 60 + (isNaN(m) ? 0 : m);
}

/**
 * Extracts shifts from either store.deliverySchedule.shifts or from the human-readable store.hours string
 */
export function getStoreShifts(store: Store): DeliveryShift[] {
  // If structured shifts exist and have valid entries, return them
  if (store.deliverySchedule?.shifts && store.deliverySchedule.shifts.length > 0) {
    const valid = store.deliverySchedule.shifts.filter(
      (s) => parseTimeToMinutes(s.from) !== null && parseTimeToMinutes(s.to) !== null
    );
    if (valid.length > 0) return valid;
  }

  // Fallback: parse from store.hours string (e.g. "Martes a domingo · 11:30 a 15 y 19:30 a 22:30")
  const shifts: DeliveryShift[] = [];
  if (!store.hours) return shifts;

  // Regex matching patterns like "11:30 a 15", "19:30 a 22:30", "11 a 15:30", "11:00-15:00"
  const regex = /(\d{1,2}(?::\d{2})?)\s*(?:a|-|hasta)\s*(\d{1,2}(?::\d{2})?)/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(store.hours)) !== null) {
    const rawFrom = match[1];
    const rawTo = match[2];

    const fromMin = parseTimeToMinutes(rawFrom);
    const toMin = parseTimeToMinutes(rawTo);

    if (fromMin !== null && toMin !== null) {
      const formatTime = (min: number) => {
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      };
      shifts.push({
        from: formatTime(fromMin),
        to: formatTime(toMin),
      });
    }
  }

  return shifts;
}

/**
 * Determines whether the store is currently open and can accept delivery orders
 * based on the hours set in admin and the Argentina local time.
 */
export function getStoreScheduleStatus(
  store: Store,
  refDate: Date = new Date()
): ScheduleStatus {
  // Get current Argentina time
  const timeFormatter = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const currentArgentinaTime = timeFormatter.format(refDate);
  const [nowH, nowM] = currentArgentinaTime.split(":").map(Number);
  const currentMinutes = nowH * 60 + nowM;

  // Get day of week in Argentina (0 = Domingo, 1 = Lunes, etc.)
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "short",
  });
  const dayOfWeek = dayFormatter.format(refDate).toLowerCase(); // "mon", "tue", ...

  // 1. Check if delivery is disabled entirely
  if (!store.deliveryEnabled) {
    return {
      isOpen: false,
      canDeliver: false,
      statusText: "Delivery deshabilitado",
      reason: "El servicio de delivery no está disponible actualmente.",
      currentArgentinaTime,
    };
  }

  // 2. Check master manual switch (if admin turned off the store)
  if (!store.open) {
    return {
      isOpen: false,
      canDeliver: false,
      statusText: "Cocina cerrada",
      reason: "El local se encuentra cerrado temporalmente para pedidos.",
      currentArgentinaTime,
    };
  }

  // 3. Check days closed (e.g. if hours mention "Martes a domingo" and today is Monday)
  if (store.hours) {
    const textLower = store.hours.toLowerCase();
    if (textLower.includes("martes a domingo") && dayOfWeek === "mon") {
      return {
        isOpen: false,
        canDeliver: false,
        statusText: "Cerrado los lunes",
        reason: `Hoy lunes el local permanece cerrado. Horarios de entrega: ${store.hours}.`,
        currentArgentinaTime,
      };
    }
  }

  // 4. Check time shifts
  const shifts = getStoreShifts(store);

  // If no shifts could be detected, rely on store.open
  if (shifts.length === 0) {
    return {
      isOpen: true,
      canDeliver: true,
      statusText: "Abierto",
      currentArgentinaTime,
    };
  }

  // Check if current minute is within ANY active shift
  for (const shift of shifts) {
    const startMin = parseTimeToMinutes(shift.from);
    const endMin = parseTimeToMinutes(shift.to);

    if (startMin !== null && endMin !== null) {
      // Normal shift (e.g. 11:30 to 15:00)
      if (startMin <= endMin) {
        if (currentMinutes >= startMin && currentMinutes < endMin) {
          return {
            isOpen: true,
            canDeliver: true,
            statusText: "Abierto ahora",
            currentArgentinaTime,
          };
        }
      } else {
        // Overnight shift (e.g. 20:00 to 02:00)
        if (currentMinutes >= startMin || currentMinutes < endMin) {
          return {
            isOpen: true,
            canDeliver: true,
            statusText: "Abierto ahora",
            currentArgentinaTime,
          };
        }
      }
    }
  }

  // Currently outside all shifts: find the next upcoming shift today
  const upcoming = shifts
    .map((s) => ({ ...s, startMin: parseTimeToMinutes(s.from) || 0 }))
    .filter((s) => s.startMin > currentMinutes)
    .sort((a, b) => a.startMin - b.startMin)[0];

  const nextOpening = upcoming ? `Abre a las ${upcoming.from} hs` : `Abre mañana según horario (${store.hours})`;

  return {
    isOpen: false,
    canDeliver: false,
    statusText: "Cerrado por horario",
    reason: `El local está cerrado para envíos en este momento (${currentArgentinaTime} hs). Horarios: ${store.hours}. ${nextOpening}.`,
    currentArgentinaTime,
    nextOpening,
  };
}
