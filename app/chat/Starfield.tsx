"use client";

// Animated starfield background — classic "warp through space" effect.
// Pure canvas, no images or video. Runs at requestAnimationFrame speed
// but with a low star density and slow speed so it stays subtle.

import { useEffect, useRef } from "react";

const STAR_COUNT = 220;
const SPEED = 0.35; // higher = faster warp
const TRAIL_OPACITY = 0.18; // higher = shorter trails (snappier)

type Star = { x: number; y: number; z: number; pz: number };

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const stars: Star[] = [];

    function reset(star: Star, fresh = false) {
      star.x = (Math.random() - 0.5) * width;
      star.y = (Math.random() - 0.5) * height;
      star.z = fresh ? Math.random() * width : width;
      star.pz = star.z;
    }

    function init() {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        const s = { x: 0, y: 0, z: 0, pz: 0 };
        reset(s, true);
        stars.push(s);
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    }

    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    function tick() {
      // Slight motion-blur trail effect — instead of a hard clear we paint
      // a translucent dark rect, which fades old star pixels gradually.
      ctx!.fillStyle = `rgba(8, 8, 18, ${TRAIL_OPACITY})`;
      ctx!.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (const s of stars) {
        s.pz = s.z;
        s.z -= SPEED;
        if (s.z < 1) {
          reset(s);
          continue;
        }

        // 3D projection: as z shrinks, points move outward from center.
        const k = 128 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        if (px < 0 || px >= width || py < 0 || py >= height) {
          reset(s);
          continue;
        }

        const pk = 128 / s.pz;
        const ppx = s.x * pk + cx;
        const ppy = s.y * pk + cy;

        const depth = 1 - s.z / width; // 0 (far) → 1 (near)
        const size = depth * 1.6 + 0.2;
        const alpha = depth * 0.9 + 0.1;

        // Streak each star from previous to current position so faster
        // (closer) stars get visible warp lines, distant stars look like dots.
        ctx!.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx!.lineWidth = size;
        ctx!.beginPath();
        ctx!.moveTo(ppx, ppy);
        ctx!.lineTo(px, py);
        ctx!.stroke();
      }

      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}
