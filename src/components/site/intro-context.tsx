"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type IntroContextValue = {
  active: boolean;
  beginIntro: () => void;
  endIntro: () => void;
};

const IntroContext = createContext<IntroContextValue | null>(null);

export function IntroProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [active, setActive] = useState(pathname === "/");

  useEffect(() => {
    if (pathname !== "/") setActive(false);
  }, [pathname]);

  useEffect(() => {
    if (active) {
      document.documentElement.dataset.intro = "1";
      return;
    }
    delete document.documentElement.dataset.intro;
  }, [active]);

  const beginIntro = useCallback(() => setActive(true), []);
  const endIntro = useCallback(() => setActive(false), []);

  const value = useMemo(
    () => ({ active, beginIntro, endIntro }),
    [active, beginIntro, endIntro],
  );

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

export function useIntro() {
  const context = useContext(IntroContext);
  if (!context) {
    throw new Error("useIntro must be used within IntroProvider");
  }
  return context;
}
