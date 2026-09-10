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

const AUDIO_SRC = "/audiofile.mpeg";
const FFT_SIZE = 512;

type FrequencyListener = (data: Uint8Array<ArrayBuffer>) => void;

type SoundContextValue = {
  enabled: boolean;
  mounted: boolean;
  toggle: () => Promise<void>;
  subscribeLevels: (listener: FrequencyListener) => () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafRef = useRef<number | null>(null);
  const enabledRef = useRef(false);
  const listenersRef = useRef(new Set<FrequencyListener>());

  useEffect(() => {
    setMounted(true);
  }, []);

  const stopVisual = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const draw = useCallback(() => {
    const analyser = analyserRef.current;
    const data = dataRef.current;
    if (!analyser || !data || !enabledRef.current) return;

    analyser.getByteFrequencyData(data);
    listenersRef.current.forEach((listener) => listener(data));
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  const subscribeLevels = useCallback((listener: FrequencyListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const ensureAudio = useCallback(async () => {
    if (!audioRef.current) {
      const audio = new Audio(AUDIO_SRC);
      audio.loop = true;
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;
    }

    if (!ctxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) throw new Error("Web Audio API unavailable");
      ctxRef.current = new AudioCtx();
    }

    const ctx = ctxRef.current;
    if (ctx.state === "suspended") await ctx.resume();

    if (!analyserRef.current && audioRef.current && !sourceRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.78;
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(
        new ArrayBuffer(analyser.frequencyBinCount),
      );

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      sourceRef.current = source;
    }

    return audioRef.current;
  }, []);

  const disableSound = useCallback(() => {
    enabledRef.current = false;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setEnabled(false);
    stopVisual();
  }, [stopVisual]);

  const enableSound = useCallback(async () => {
    const audio = await ensureAudio();
    await audio.play();
    enabledRef.current = true;
    setEnabled(true);
    stopVisual();
    rafRef.current = requestAnimationFrame(draw);
  }, [draw, ensureAudio, stopVisual]);

  const toggle = useCallback(async () => {
    try {
      if (enabledRef.current) {
        disableSound();
      } else {
        await enableSound();
      }
    } catch {
      disableSound();
    }
  }, [disableSound, enableSound]);

  useEffect(() => {
    return () => {
      enabledRef.current = false;
      stopVisual();
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      try {
        sourceRef.current?.disconnect();
        analyserRef.current?.disconnect();
      } catch {
        /* already disconnected */
      }
      void ctxRef.current?.close();
      audioRef.current = null;
      sourceRef.current = null;
      analyserRef.current = null;
      ctxRef.current = null;
      dataRef.current = null;
    };
  }, [stopVisual]);

  const value = useMemo(
    () => ({ enabled, mounted, toggle, subscribeLevels }),
    [enabled, mounted, toggle, subscribeLevels],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error("useSound must be used within SoundProvider");
  }
  return ctx;
}
