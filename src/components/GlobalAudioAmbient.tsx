"use client";

import { useEffect, useRef } from "react";
import type { GlobalTrack } from "@/lib/globalAudio";

interface Orb {
  targetAnchorX: number;
  targetAnchorY: number;
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
  phase: number;
  orbitRadius: number;
  size: number;
  hue: number;
  speed: number;
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function getAmbientZone() {
  const isMobile = window.innerWidth < 768;
  const top = isMobile ? 64 : 72;
  const bottom = isMobile ? 120 : 104;

  return {
    top,
    bottom,
    width: window.innerWidth,
    height: Math.max(window.innerHeight - top - bottom, 240),
  };
}

function createOrbs(seed: number, width: number, height: number): Orb[] {
  const count = 3 + (seed % 4);
  const paddingX = width * 0.1;
  const paddingY = height * 0.12;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  return Array.from({ length: count }, (_, i) => {
    const s = seed + i * 9973;
    const angle = ((s % 360) * Math.PI) / 180;
    const distX = 0.08 + ((s >> 4) % 30) / 100;
    const distY = 0.08 + ((s >> 8) % 30) / 100;
    const anchorX = paddingX + usableWidth * (0.5 + Math.cos(angle) * distX);
    const anchorY = paddingY + usableHeight * (0.5 + Math.sin(angle * 1.17) * distY);

    return {
      targetAnchorX: anchorX,
      targetAnchorY: anchorY,
      anchorX,
      anchorY,
      x: anchorX,
      y: anchorY,
      phase: (s % 628) / 100,
      orbitRadius: 28 + (s % 72),
      size: 42 + (s % 88),
      hue: 188 + (s % 32),
      speed: 0.28 + ((s >> 6) % 45) / 100,
    };
  });
}

function getBandEnergy(data: Uint8Array, start: number, end: number) {
  let sum = 0;
  for (let i = start; i < end && i < data.length; i++) sum += data[i];
  return sum / ((end - start) * 255);
}

export default function GlobalAudioAmbient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbsRef = useRef<Orb[]>([]);
  const seedRef = useRef(1);
  const trackSrcRef = useRef("");
  const isPlayingRef = useRef(false);
  const sizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== "undefined" && (window as Window & { isGlobalAudioPlaying?: boolean }).isGlobalAudioPlaying) {
      isPlayingRef.current = true;
    }

    const handleTrack = (e: Event) => {
      const track = (e as CustomEvent<GlobalTrack>).detail;
      if (!track?.src || track.src === trackSrcRef.current) return;

      trackSrcRef.current = track.src;
      seedRef.current = hashString(track.src);
      const { width, height } = sizeRef.current;
      if (width && height) {
        const nextOrbs = createOrbs(seedRef.current, width, height);
        const prev = orbsRef.current;

        orbsRef.current = nextOrbs.map((orb, i) => {
          const previous = prev[i];
          if (!previous) return orb;
          return {
            ...orb,
            x: previous.x,
            y: previous.y,
            anchorX: previous.anchorX,
            anchorY: previous.anchorY,
          };
        });
      }
    };

    const handleState = (e: Event) => {
      isPlayingRef.current = (e as CustomEvent<boolean>).detail;
    };

    window.addEventListener("global-audio-track", handleTrack);
    window.addEventListener("global-audio-state", handleState);

    return () => {
      window.removeEventListener("global-audio-track", handleTrack);
      window.removeEventListener("global-audio-state", handleState);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrameId = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const zone = getAmbientZone();
      const { width, height } = zone;
      sizeRef.current = { width, height };

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      orbsRef.current = createOrbs(seedRef.current, width, height);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = (time: number) => {
      const { width, height } = sizeRef.current;
      if (!width || !height) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const analyser = (window as Window & { globalAudioAnalyser?: AnalyserNode }).globalAudioAnalyser;
      const dataArray = (window as Window & { globalAudioDataArray?: Uint8Array }).globalAudioDataArray;

      let bass = 0.08;
      let mid = 0.06;
      let high = 0.04;

      if (analyser && dataArray && isPlayingRef.current) {
        // Ensure we pass a Uint8Array backed by an ArrayBuffer to satisfy
        // TypeScript's DOM definitions (avoid SharedArrayBuffer issues).
        const freqData = new Uint8Array(dataArray);
        analyser.getByteFrequencyData(freqData);
        bass = 0.12 + getBandEnergy(dataArray, 0, 8) * 0.9;
        mid = 0.08 + getBandEnergy(dataArray, 8, 40) * 0.75;
        high = 0.05 + getBandEnergy(dataArray, 40, 120) * 0.65;
      } else if (!prefersReducedMotion) {
        const idle = time * 0.001;
        bass = 0.1 + Math.sin(idle * 1.4) * 0.04;
        mid = 0.08 + Math.sin(idle * 1.1 + 1.2) * 0.03;
        high = 0.06 + Math.sin(idle * 0.9 + 2.4) * 0.02;
      }

      const motionScale = isPlayingRef.current ? 1 : 0.55;
      const orbs = orbsRef.current;
      const t = time * 0.001;

      ctx.clearRect(0, 0, width, height);

      for (const orb of orbs) {
        orb.anchorX += (orb.targetAnchorX - orb.anchorX) * 0.025;
        orb.anchorY += (orb.targetAnchorY - orb.anchorY) * 0.025;

        const pulse = 1 + bass * (isPlayingRef.current ? 0.85 : 0.35);
        const orbit = orb.orbitRadius * pulse * motionScale;
        const angle = t * orb.speed * (isPlayingRef.current ? 1.6 : 0.7) + orb.phase;

        orb.x = orb.anchorX + Math.cos(angle) * orbit;
        orb.y = orb.anchorY + Math.sin(angle * 1.25) * orbit * 0.75;
      }

      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < orbs.length; i++) {
        for (let j = i + 1; j < orbs.length; j++) {
          const a = orbs[i];
          const b = orbs[j];
          const lineAlpha = 0.04 + high * 0.18 * motionScale;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          const cx = (a.x + b.x) / 2 + Math.sin(t + a.phase) * 40 * mid;
          const cy = (a.y + b.y) / 2 + Math.cos(t * 1.2 + b.phase) * 30 * mid;
          ctx.quadraticCurveTo(cx, cy, b.x, b.y);
          ctx.strokeStyle = `hsla(${a.hue}, 85%, 65%, ${lineAlpha})`;
          ctx.lineWidth = 1 + mid * 2.5;
          ctx.stroke();
        }
      }

      for (const orb of orbs) {
        const radius = orb.size * (0.7 + bass * 0.65) * motionScale;
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, radius);
        gradient.addColorStop(0, `hsla(${orb.hue}, 90%, 72%, ${0.1 + mid * 0.14})`);
        gradient.addColorStop(0.45, `hsla(${orb.hue + 8}, 85%, 58%, ${0.05 + bass * 0.08})`);
        gradient.addColorStop(1, "hsla(210, 80%, 50%, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, 2 + high * 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${orb.hue}, 95%, 88%, ${0.25 + high * 0.45})`;
        ctx.fill();
      }

      const sweepX = width * (0.22 + ((seedRef.current % 100) / 100) * 0.56);
      const sweepY = height * (0.38 + (((seedRef.current >> 4) % 100) / 100) * 0.24);
      const sweepRadius = Math.min(width, height) * (0.22 + bass * 0.12);
      const sweep = ctx.createRadialGradient(sweepX, sweepY, 0, sweepX, sweepY, sweepRadius);
      sweep.addColorStop(0, `hsla(200, 90%, 60%, ${0.02 + bass * 0.05})`);
      sweep.addColorStop(1, "hsla(210, 80%, 50%, 0)");
      ctx.fillStyle = sweep;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "source-over";
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} id="global-audio-ambient-canvas" aria-hidden="true" />;
}
