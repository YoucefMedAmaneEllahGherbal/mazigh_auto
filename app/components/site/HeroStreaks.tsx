"use client";

import { useEffect, useRef } from "react";

/**
 * Night-road light trails behind the hero (long-exposure photo look).
 * Dependency-free canvas, ~2 KB. Pauses off-screen / in background tabs and
 * renders one still frame for visitors who prefer reduced motion.
 */

type Streak = {
  lane: number; // 0..1 across the road
  t: number; // 0 = horizon, 1 = past the viewer
  length: number;
  speed: number;
  color: [number, number, number];
  incoming: boolean; // headlights coming towards us vs taillights leaving
};

const HEAD: [number, number, number] = [255, 240, 214];
const TAIL: [number, number, number] = [255, 38, 52];
const AMBER: [number, number, number] = [255, 170, 60];

function makeStreak(randomT: boolean): Streak {
  const incoming = Math.random() < 0.45;
  const roll = Math.random();
  return {
    lane: Math.random(),
    t: randomT ? Math.random() : incoming ? 0 : 1.15,
    length: 0.06 + Math.random() * 0.16,
    speed: 0.0012 + Math.random() * 0.0026,
    color: incoming ? HEAD : roll < 0.15 ? AMBER : TAIL,
    incoming,
  };
}

export function HeroStreaks({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = window.innerWidth < 640 ? 26 : 46;
    const streaks: Streak[] = Array.from({ length: count }, () => makeStreak(true));

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Perspective road: every lane fans out from a vanishing point.
    const point = (lane: number, t: number) => {
      const hx = width * 0.62;
      const hy = height * 0.46;
      const spread = width * 1.9;
      const ex = hx + (lane - 0.5) * spread;
      const ey = height * 1.12;
      const k = t * t; // ease so trails accelerate toward the viewer
      return [hx + (ex - hx) * k, hy + (ey - hy) * k] as const;
    };

    const draw = (step: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      for (const s of streaks) {
        s.t += (s.incoming ? 1 : -1) * s.speed * step * (0.6 + s.t);
        if (s.incoming ? s.t > 1.15 : s.t < 0.02) Object.assign(s, makeStreak(false));

        const head = Math.min(s.t, 1.15);
        const tail = s.incoming ? head - s.length : head + s.length;
        const [x1, y1] = point(s.lane, Math.max(0, tail));
        const [x2, y2] = point(s.lane, Math.max(0, head));
        const depth = Math.min(1, Math.max(0.05, head));
        const [r, g, b] = s.color;
        const fade = Math.min(1, head * 3); // dim near the horizon

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},${0.85 * fade})`);

        // soft glow pass
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = 0.22;
        ctx.lineWidth = 1 + depth * 9;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // bright core
        ctx.globalAlpha = 1;
        ctx.lineWidth = 0.4 + depth * 2.2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    resize();

    if (reduceMotion) {
      draw(0);
      const onResize = () => {
        resize();
        draw(0);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    let frame = 0;
    let last = 0;
    let visible = true;

    const loop = (now: number) => {
      const step = last ? Math.min(3, (now - last) / 16.67) : 1;
      last = now;
      draw(step);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (frame || !visible || document.hidden) return;
      last = 0;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    observer.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize);
    start();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
