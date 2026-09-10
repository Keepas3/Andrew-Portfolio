"use client";

import { useEffect, useRef } from "react";

function getBandEnergy(data: Uint8Array, start: number, end: number) {
  let sum = 0;
  for (let i = start; i < end && i < data.length; i++) sum += data[i];
  return sum / ((end - start) * 255);
}

/**
 * Drives site-wide "audio-reactive UI" by writing --audio-bass/mid/high
 * custom properties onto the document root each frame. Structural
 * elements (dividers, borders, card glows) read these via var(...) in
 * globals.css, so no per-component wiring is needed to react to the beat.
 */
export default function GlobalAudioMotion() {
  const isPlayingRef = useRef(false);
  const smoothedRef = useRef({ bass: 0, mid: 0, high: 0 });

  useEffect(() => {
    if (typeof window !== "undefined" && (window as Window & { isGlobalAudioPlaying?: boolean }).isGlobalAudioPlaying) {
      isPlayingRef.current = true;
    }

    const handleState = (e: Event) => {
      isPlayingRef.current = (e as CustomEvent<boolean>).detail;
    };

    window.addEventListener("global-audio-state", handleState);
    return () => window.removeEventListener("global-audio-state", handleState);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const root = document.documentElement;
    let animationFrameId = 0;
    let lastTickTime = 0;
    // Writing CSS custom properties on :root triggers a style recalculation
    // for every element site-wide that references them in a box-shadow —
    // dozens of elements, potentially many more on pages with long album
    // grids. Throttling how often we actually write (rather than doing it
    // every animation frame) is the main lever on "the site feels laggy
    // while music plays".
    const targetTickInterval = 1000 / 30;

    const tick = (time: number) => {
      if (time - lastTickTime < targetTickInterval) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }
      lastTickTime = time;

      const analyser = (window as Window & { globalAudioAnalyser?: AnalyserNode }).globalAudioAnalyser;
      const dataArray = (window as Window & { globalAudioDataArray?: Uint8Array }).globalAudioDataArray;

      let targetBass = 0;
      let targetMid = 0;
      let targetHigh = 0;

      if (analyser && dataArray && isPlayingRef.current) {
        const freqData = new Uint8Array(dataArray);
        analyser.getByteFrequencyData(freqData);
        targetBass = getBandEnergy(freqData, 0, 8);
        targetMid = getBandEnergy(freqData, 8, 40);
        targetHigh = getBandEnergy(freqData, 40, 120);
      }

      // Attack fast toward a louder target (so hits feel punchy) but release
      // slowly back down (so it doesn't flicker), rather than a single flat
      // smoothing factor in both directions.
      const s = smoothedRef.current;
      const ease = (current: number, target: number) => {
        const rate = target > current ? 0.4 : 0.08;
        return current + (target - current) * rate;
      };
      s.bass = ease(s.bass, targetBass);
      s.mid = ease(s.mid, targetMid);
      s.high = ease(s.high, targetHigh);

      root.style.setProperty("--audio-bass", s.bass.toFixed(3));
      root.style.setProperty("--audio-mid", s.mid.toFixed(3));
      root.style.setProperty("--audio-high", s.high.toFixed(3));

      // Mirror the same smoothed values onto window so other JS-driven
      // effects (e.g. ElectricBorder's canvas animation) can read them
      // without each re-sampling the analyser or forcing a style read.
      (window as Window & { __audioBands?: { bass: number; mid: number; high: number } }).__audioBands = {
        bass: s.bass,
        mid: s.mid,
        high: s.high,
      };

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return null;
}
