"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

// Adapted from the "ElectricBorder" concept by @BalintFerenczy
// (https://codepen.io/BalintFerenczy/pen/KwdoyEN) — reimplemented from
// scratch here (no external deps) and wired into this site's shared
// audio-reactive bands so the border gets noticeably more chaotic and
// faster while a track is playing, and settles to a near-still line when
// nothing is playing.

interface ElectricBorderProps {
  children: ReactNode;
  color?: string;
  speed?: number;
  chaos?: number;
  borderRadius?: number;
  className?: string;
  style?: CSSProperties;
}

function random(x: number) {
  return (Math.sin(x * 12.9898) * 43758.5453) % 1;
}

function noise2D(x: number, y: number) {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;

  const a = random(i + j * 57);
  const b = random(i + 1 + j * 57);
  const c = random(i + (j + 1) * 57);
  const d = random(i + 1 + (j + 1) * 57);

  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
}

function octavedNoise(x: number, octaves: number, lacunarity: number, gain: number, baseAmplitude: number, baseFrequency: number, time: number, seed: number) {
  let y = 0;
  let amplitude = baseAmplitude;
  let frequency = baseFrequency;

  for (let i = 0; i < octaves; i++) {
    y += amplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return y;
}

function getCornerPoint(cx: number, cy: number, r: number, startAngle: number, arcLength: number, progress: number) {
  const angle = startAngle + progress * arcLength;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function getRoundedRectPoint(t: number, left: number, top: number, width: number, height: number, radius: number) {
  const straightWidth = width - 2 * radius;
  const straightHeight = height - 2 * radius;
  const cornerArc = (Math.PI * radius) / 2;
  const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
  const distance = t * totalPerimeter;

  let accumulated = 0;

  if (distance <= accumulated + straightWidth) {
    const progress = (distance - accumulated) / straightWidth;
    return { x: left + radius + progress * straightWidth, y: top };
  }
  accumulated += straightWidth;

  if (distance <= accumulated + cornerArc) {
    const progress = (distance - accumulated) / cornerArc;
    return getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, progress);
  }
  accumulated += cornerArc;

  if (distance <= accumulated + straightHeight) {
    const progress = (distance - accumulated) / straightHeight;
    return { x: left + width, y: top + radius + progress * straightHeight };
  }
  accumulated += straightHeight;

  if (distance <= accumulated + cornerArc) {
    const progress = (distance - accumulated) / cornerArc;
    return getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, progress);
  }
  accumulated += cornerArc;

  if (distance <= accumulated + straightWidth) {
    const progress = (distance - accumulated) / straightWidth;
    return { x: left + width - radius - progress * straightWidth, y: top + height };
  }
  accumulated += straightWidth;

  if (distance <= accumulated + cornerArc) {
    const progress = (distance - accumulated) / cornerArc;
    return getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, progress);
  }
  accumulated += cornerArc;

  if (distance <= accumulated + straightHeight) {
    const progress = (distance - accumulated) / straightHeight;
    return { x: left, y: top + height - radius - progress * straightHeight };
  }
  accumulated += straightHeight;

  const progress = (distance - accumulated) / cornerArc;
  return getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, progress);
}

export default function ElectricBorder({
  children,
  color = "#38bdf8",
  speed = 1,
  chaos = 0.14,
  borderRadius = 16,
  className,
  style,
}: ElectricBorderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef(0);
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      isPlayingRef.current = !!(window as Window & { isGlobalAudioPlaying?: boolean }).isGlobalAudioPlaying;
    }

    const handleState = (e: Event) => {
      isPlayingRef.current = (e as CustomEvent<boolean>).detail;
    };

    window.addEventListener("global-audio-state", handleState);
    return () => window.removeEventListener("global-audio-state", handleState);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const octaves = 5;
    const lacunarity = 1.6;
    const gain = 0.7;
    const baseFrequency = 6;
    const displacement = 10;
    const borderOffset = 12;

    let width = 0;
    let height = 0;
    let lastDpr = Math.min(window.devicePixelRatio || 1, 2);

    // The traced path's geometry (sample point positions along the rounded
    // rect) only depends on the container's size, not on time — so it's
    // computed once here and cached, instead of being recomputed from
    // scratch for every sample point on every single animation frame.
    // Only the noise displacement in draw() actually needs to run per frame.
    let basePoints: { x: number; y: number }[] = [];

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width + borderOffset * 2;
      height = rect.height + borderOffset * 2;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const left = borderOffset;
      const top = borderOffset;
      const borderWidth = Math.max(width - borderOffset * 2, 1);
      const borderHeight = Math.max(height - borderOffset * 2, 1);
      const maxRadius = Math.min(borderWidth, borderHeight) / 2;
      const radius = Math.min(borderRadius, maxRadius);

      const approxPerimeter = 2 * (borderWidth + borderHeight);
      const sampleCount = Math.max(24, Math.floor(approxPerimeter / 5));

      basePoints = [];
      for (let i = 0; i <= sampleCount; i++) {
        basePoints.push(getRoundedRectPoint(i / sampleCount, left, top, borderWidth, borderHeight, radius));
      }
    };

    updateSize();

    // Each instance runs its own canvas + noise computation, and a page
    // can have several of these at once (e.g. 6 on the profile page).
    // Redrawing at a full 60fps per instance adds up; capping to ~30fps
    // keeps the effect looking just as smooth while roughly halving that
    // per-instance CPU cost.
    let lastDrawTime = 0;
    const targetDrawInterval = 1000 / 30;

    const draw = (currentTime: number) => {
      if (!canvas || !ctx) return;

      if (currentTime - lastDrawTime < targetDrawInterval) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      lastDrawTime = currentTime;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (dpr !== lastDpr) {
        lastDpr = dpr;
        updateSize();
      }

      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = currentTime;

      const bands = (window as Window & { __audioBands?: { bass: number; mid: number; high: number } }).__audioBands || { bass: 0, mid: 0, high: 0 };
      const playing = isPlayingRef.current;

      // More intense (faster, more chaotic) while a track is playing;
      // settles to a near-still line when nothing is playing.
      const speedScale = playing ? 0.8 + bands.mid * 1.6 : 0.2;
      const chaosScale = playing ? 0.55 + bands.bass * 1.9 : prefersReducedMotion ? 0.04 : 0.12;

      timeRef.current += Math.min(deltaTime, 0.1) * speed * speedScale;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const amplitude = chaos * chaosScale;
      const sampleCount = basePoints.length - 1;

      ctx.beginPath();
      for (let i = 0; i <= sampleCount; i++) {
        const progress = i / sampleCount;
        const point = basePoints[i];

        const xNoise = octavedNoise(progress * 8, octaves, lacunarity, gain, amplitude, baseFrequency, timeRef.current, 0);
        const yNoise = octavedNoise(progress * 8, octaves, lacunarity, gain, amplitude, baseFrequency, timeRef.current, 1);

        const dx = point.x + xNoise * displacement;
        const dy = point.y + yNoise * displacement;

        if (i === 0) ctx.moveTo(dx, dy);
        else ctx.lineTo(dx, dy);
      }
      ctx.closePath();
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [color, speed, chaos, borderRadius]);

  return (
    <div
      ref={containerRef}
      className={`electric-border ${className ?? ""}`}
      style={{ "--electric-border-color": color, borderRadius, ...style } as CSSProperties}
    >
      <div className="eb-canvas-container">
        <canvas ref={canvasRef} className="eb-canvas" />
      </div>
      <div className="eb-layers">
        <div className="eb-glow-1" />
        <div className="eb-glow-2" />
      </div>
      {children}
    </div>
  );
}
