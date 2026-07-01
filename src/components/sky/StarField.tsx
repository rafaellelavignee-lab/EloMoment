import { useEffect, useRef } from "react";

interface Star { x: number; y: number; r: number; speed: number; phase: number; layer: number; }

/**
 * Céu estrelado em canvas: estrelas piscando em 3 camadas com parallax
 * sutil ao movimento do mouse. Respeita prefers-reduced-motion.
 */
export default function StarField({ density = 1 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Star[] = [];
    let raf = 0;
    const mouse = { x: 0, y: 0 };

    function resize() {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      const count = Math.min(220, Math.floor((window.innerWidth * window.innerHeight) / 9000) * density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (Math.random() * 1.4 + 0.4) * devicePixelRatio,
        speed: Math.random() * 0.015 + 0.004,
        phase: Math.random() * Math.PI * 2,
        layer: Math.ceil(Math.random() * 3),
      }));
    }

    function onMouse(e: MouseEvent) {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    let t = 0;
    function draw() {
      t += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const tw = reduced ? 0.8 : 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        const px = s.x + (reduced ? 0 : mouse.x * s.layer * 6 * devicePixelRatio);
        const py = s.y + (reduced ? 0 : mouse.y * s.layer * 6 * devicePixelRatio);
        ctx.globalAlpha = 0.25 + tw * 0.75;
        ctx.fillStyle = s.layer === 3 && s.r > 1.4 ? "#F8D76E" : "#FFFFFF";
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  );
}
