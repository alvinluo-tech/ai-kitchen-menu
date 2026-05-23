"use client";

import { useRef, useEffect, useCallback, useState } from "react";

type SpinWheelProps = {
  items: string[];
  spinning: boolean;
  targetIndex: number;
  onSpinEnd: () => void;
};

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 12;
const POINTER_SIZE = 16;

// Orange gradient colors for sectors
const SECTOR_COLORS = [
  "#f97316", // orange-500
  "#fb923c", // orange-400
  "#fdba74", // orange-300
  "#ea580c", // orange-600
  "#f59e0b", // amber-500
  "#d97706", // amber-600
  "#fbbf24", // amber-400
  "#c2410c", // orange-700
];

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function drawWheel(
  ctx: CanvasRenderingContext2D,
  items: string[],
  rotation: number,
  highlightIndex: number,
) {
  const count = items.length;
  if (count === 0) return;

  ctx.clearRect(0, 0, SIZE, SIZE);

  // Draw outer ring shadow
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.restore();

  const sectorAngle = (Math.PI * 2) / count;

  // Draw sectors
  for (let i = 0; i < count; i++) {
    const startAngle = rotation + i * sectorAngle - Math.PI / 2;
    const endAngle = startAngle + sectorAngle;
    const isHighlighted = i === highlightIndex;

    // Sector fill
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.arc(CENTER, CENTER, RADIUS - 2, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = isHighlighted
      ? "#ea580c"
      : SECTOR_COLORS[i % SECTOR_COLORS.length];
    ctx.fill();

    // Sector border
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text
    ctx.save();
    ctx.translate(CENTER, CENTER);
    ctx.rotate(startAngle + sectorAngle / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = isHighlighted ? "#fff" : "#fff";
    ctx.font = isHighlighted
      ? "bold 14px system-ui, sans-serif"
      : "13px system-ui, sans-serif";

    const textRadius = RADIUS * 0.62;
    const name = items[i].length > 6 ? items[i].slice(0, 6) + ".." : items[i];
    ctx.fillText(name, textRadius, 0);
    ctx.restore();
  }

  // Center circle
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 36, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "#fed7aa";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Center text
  ctx.fillStyle = "#ea580c";
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("装盘", CENTER, CENTER);
}

function drawPointer(ctx: CanvasRenderingContext2D) {
  // Draw pointer triangle at top
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(CENTER, CENTER - RADIUS - POINTER_SIZE + 4);
  ctx.lineTo(CENTER - POINTER_SIZE / 2, CENTER - RADIUS - POINTER_SIZE - POINTER_SIZE + 4);
  ctx.lineTo(CENTER + POINTER_SIZE / 2, CENTER - RADIUS - POINTER_SIZE - POINTER_SIZE + 4);
  ctx.closePath();
  ctx.fillStyle = "#dc2626";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function SpinWheel({
  items,
  spinning,
  targetIndex,
  onSpinEnd,
}: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const [currentHighlight, setCurrentHighlight] = useState(-1);

  // Create offscreen canvas once
  useEffect(() => {
    const offscreen = document.createElement("canvas");
    offscreen.width = SIZE;
    offscreen.height = SIZE;
    offscreenRef.current = offscreen;
  }, []);

  // Draw wheel when items change (no spin)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawWheel(ctx, items, 0, -1);
    drawPointer(ctx);
  }, [items]);

  // Spin animation
  useEffect(() => {
    if (!spinning || items.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) return;
    const ctx = maybeCtx;

    const count = items.length;
    const sectorAngle = (Math.PI * 2) / count;

    // Calculate target rotation: land on targetIndex
    // The pointer is at top (-π/2), so we need to rotate so that
    // the target sector's center aligns with the top
    const targetAngle = -(targetIndex * sectorAngle + sectorAngle / 2);
    // Add multiple full rotations for dramatic effect (5-8 spins)
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * Math.PI * 2;
    const totalRotation = extraSpins + targetAngle;

    const duration = 3500; // ms
    const startTime = performance.now();
    let lastHighlight = -1;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const currentRotation = eased * totalRotation;

      // Determine which sector the pointer is on
      const normalizedRotation = ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      // Pointer is at top (angle 0 after -π/2 offset)
      // Sector i spans from i*sectorAngle to (i+1)*sectorAngle
      // But we need to account for the rotation
      const pointerAngle = ((Math.PI * 2 - normalizedRotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const highlight = Math.floor(pointerAngle / sectorAngle) % count;

      if (highlight !== lastHighlight) {
        lastHighlight = highlight;
        setCurrentHighlight(highlight);
      }

      drawWheel(ctx, items, currentRotation, highlight);
      drawPointer(ctx);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Final state
        setCurrentHighlight(targetIndex);
        drawWheel(ctx, items, totalRotation, targetIndex);
        drawPointer(ctx);
        // Small delay before calling onSpinEnd so user can see the result
        setTimeout(onSpinEnd, 600);
      }
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [spinning, targetIndex, items, onSpinEnd]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="w-[280px] h-[280px] md:w-[320px] md:h-[320px]"
      />
    </div>
  );
}
