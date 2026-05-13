import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface AuroraBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
}

const LIGHT_COLORS = [
  'rgba(168, 130, 255, 0.25)',   // soft violet
  'rgba(120, 200, 255, 0.2)',    // sky blue
  'rgba(255, 160, 210, 0.2)',    // rose
  'rgba(130, 230, 200, 0.18)',   // mint
  'rgba(255, 210, 130, 0.15)',   // warm amber
];

const DARK_COLORS = [
  'rgba(100, 60, 200, 0.2)',     // deep violet
  'rgba(30, 120, 200, 0.18)',    // ocean blue
  'rgba(180, 40, 120, 0.15)',    // magenta
  'rgba(20, 160, 130, 0.12)',    // teal
  'rgba(60, 40, 160, 0.15)',     // indigo
];

const AuroraBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const blobsRef = useRef<AuroraBlob[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const isDark = resolvedTheme === 'dark';
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
    const bgColor = isDark ? '#0a0a0a' : '#fafafa';

    // Initialize blobs
    const blobs: AuroraBlob[] = colors.map((color) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.min(canvas.width, canvas.height) * (0.25 + Math.random() * 0.2),
      color,
      opacity: 0.6 + Math.random() * 0.4,
    }));
    blobsRef.current = blobs;

    const draw = () => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const blob of blobs) {
        // Move
        blob.x += blob.vx;
        blob.y += blob.vy;

        // Bounce softly
        if (blob.x < -blob.radius * 0.5) blob.vx = Math.abs(blob.vx);
        if (blob.x > canvas.width + blob.radius * 0.5) blob.vx = -Math.abs(blob.vx);
        if (blob.y < -blob.radius * 0.5) blob.vy = Math.abs(blob.vy);
        if (blob.y > canvas.height + blob.radius * 0.5) blob.vy = -Math.abs(blob.vy);

        // Draw radial gradient blob
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, 'transparent');

        ctx.globalAlpha = blob.opacity;
        ctx.fillStyle = gradient;
        ctx.fillRect(
          blob.x - blob.radius,
          blob.y - blob.radius,
          blob.radius * 2,
          blob.radius * 2
        );
      }
      ctx.globalAlpha = 1;

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default AuroraBackground;
