"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Volume2, VolumeX } from "lucide-react";
import { INTRO_TRACK } from "@/lib/assets";
import { Button } from "@/components/ui/button";

type AmbientAudioContextValue = {
  play: () => Promise<boolean>;
  muted: boolean;
  playing: boolean;
  visible: boolean;
};

const AmbientAudioContext = createContext<AmbientAudioContextValue | null>(null);

function hear(audio: HTMLAudioElement) {
  audio.muted = false;
  audio.defaultMuted = false;
  audio.volume = 0.72;
}

export function AmbientAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const userMutedRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    userMutedRef.current = false;
    setMuted(false);
    hear(audio);

    if (startedRef.current && !audio.paused) {
      hear(audio);
      setPlaying(true);
      setVisible(true);
      return true;
    }

    try {
      const attempt = audio.play();
      hear(audio);
      await attempt;
      hear(audio);
      startedRef.current = true;
      setPlaying(true);
      setVisible(true);
      return true;
    } catch {
      setVisible(true);
      return false;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const keepLoud = () => {
      if (userMutedRef.current) return;
      hear(audio);
    };

    const onEnded = () => setPlaying(false);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("playing", keepLoud);
    audio.addEventListener("play", keepLoud);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("playing", keepLoud);
      audio.removeEventListener("play", keepLoud);
    };
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    setMuted((current) => {
      const next = !current;
      userMutedRef.current = next;
      if (audio) audio.muted = next;
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ play, muted, playing, visible }),
    [play, muted, playing, visible],
  );

  return (
    <AmbientAudioContext.Provider value={value}>
      <audio
        ref={audioRef}
        src={INTRO_TRACK}
        preload="auto"
        playsInline
        className="hidden"
      />
      {children}
      {visible ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => {
            if (!playing) {
              void play();
              return;
            }
            toggleMute();
          }}
          aria-label={muted ? "Activar sonido" : "Silenciar"}
          className="fixed right-5 bottom-5 z-[45] border-foreground/20 bg-ink/70 backdrop-blur-md md:right-8 md:bottom-8"
        >
          {muted ? <VolumeX /> : <Volume2 />}
        </Button>
      ) : null}
    </AmbientAudioContext.Provider>
  );
}

export function useAmbientAudio() {
  const context = useContext(AmbientAudioContext);
  if (!context) {
    throw new Error("useAmbientAudio must be used within AmbientAudioProvider");
  }
  return context;
}
