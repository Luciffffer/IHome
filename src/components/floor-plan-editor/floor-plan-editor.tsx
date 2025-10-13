'use client';

import { IFloor } from '@/models/Floor';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useGesture } from '@use-gesture/react';

interface FloorPlanEditorProps {
  floor: IFloor;
}

type InteractionMode = 'none' | 'drawing' | 'moving' | 'resizing';

export function FloorPlanEditor({ floor }: FloorPlanEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 550 });

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const gridSize = 50; // 1m = 50px
  const snappingThreshold = 10; // pixels

  // Dynamically set canvas size to match container
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function updateSize() {
      setCanvasSize({
        width: container!.clientWidth,
        height: container!.clientHeight,
      });
    }

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Draw everything
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1 / zoom;

    // Calculate the visible bounds in world coordinates
    const left = -pan.x / zoom;
    const top = -pan.y / zoom;
    const right = left + canvas.width / zoom;
    const bottom = top + canvas.height / zoom;

    // Find the first vertical and horizontal grid lines to draw
    const startX = Math.floor(left / gridSize) * gridSize;
    const startY = Math.floor(top / gridSize) * gridSize;

    // Draw vertical grid lines
    for (let x = startX; x <= right; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let y = startY; y <= bottom; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }

    ctx.restore();
  }, [floor, pan, zoom, canvasSize]);

  useGesture(
    {
      onDrag: ({ offset: [dx, dy], pinching, event, touches, buttons }) => {
        // Only allow panning if:
        // - On desktop: middle mouse button (button 1) is pressed
        // - On touch/trackpad: two fingers (touches === 2)
        const isMiddleMouse =
          event instanceof MouseEvent && event.buttons === 4;
        const isTwoFingerTouch = touches === 2;

        console.log('fingers:', touches, 'buttons:', buttons, event);

        if (!(isMiddleMouse || isTwoFingerTouch)) return;
        if (pinching) return; // Don't pan while pinching

        setPan({ x: dx, y: dy });
        event.preventDefault();
      },
      onPinch: ({ offset: [d, a], origin, event }) => {
        // d is distance, a is angle, origin is [x, y]
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const [ox, oy] = origin;
        const mouseX = ox - rect.left;
        const mouseY = oy - rect.top;

        setZoom(prevZoom => {
          const nextZoom = Math.max(0.2, Math.min(5, d));
          setPan(prevPan => {
            // World coords under finger before zoom
            const wx = (mouseX - prevPan.x) / prevZoom;
            const wy = (mouseY - prevPan.y) / prevZoom;
            // New pan so world coords stay under finger
            return {
              x: mouseX - wx * nextZoom,
              y: mouseY - wy * nextZoom,
            };
          });
          return nextZoom;
        });
        event.preventDefault();
      },
      onWheel: ({ delta: [, dy], ctrlKey, event }) => {
        // Trackpad pinch-to-zoom (ctrlKey) or two-finger scroll
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (ctrlKey) {
          setZoom(prevZoom => {
            const clampedDy = Math.max(-40, Math.min(40, dy));
            const zoomIntensity = 0.05; // Lower = less intense
            const factor = Math.exp(-clampedDy * zoomIntensity);
            const nextZoom = Math.max(0.2, Math.min(5, prevZoom * factor));
            setPan(prevPan => {
              // World coords under mouse before zoom
              const wx = (mouseX - prevPan.x) / prevZoom;
              const wy = (mouseY - prevPan.y) / prevZoom;
              // New pan so world coords stay under mouse
              return {
                x: mouseX - wx * nextZoom,
                y: mouseY - wy * nextZoom,
              };
            });
            return nextZoom;
          });
        } else {
          setPan(prev => ({ x: prev.x, y: prev.y - dy }));
        }
        event.preventDefault();
      },
    },
    {
      target: containerRef,
      eventOptions: { passive: false },
      drag: {
        from: () => [pan.x, pan.y],
        pointer: { touch: true },
        filterTaps: true,
      },
      pinch: {
        scaleBounds: { min: 0.2, max: 5 },
        rubberband: true,
      },
    }
  );

  return (
    <main className="h-full bg-muted touch-none" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width={canvasSize.width}
        height={canvasSize.height}
      />
    </main>
  );
}
