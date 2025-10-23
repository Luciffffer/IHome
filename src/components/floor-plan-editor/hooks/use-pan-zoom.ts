import { useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { CanvasState, InteractionMode } from '../floor-plan-editor';

export function usePanZoom(
    containerRef: React.RefObject<HTMLElement | null>, 
    interactionMode: InteractionMode,
    canvasState: CanvasState
) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const isPanningAllowed = canvasState === 'none' && interactionMode === 'select';

  const gestureHandlers = useGesture(
    {
      onDrag: ({ offset: [dx, dy], event }) => {
        if (!isPanningAllowed) return;
        setPan({ x: dx, y: dy });
        event.preventDefault();
      },
      onPinch: ({ offset: [d], origin, event }) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const [ox, oy] = origin;
        const mouseX = ox - rect.left;
        const mouseY = oy - rect.top;

        // Calculate world coordinates of mouse position before zoom
        const worldX = (mouseX - pan.x) / zoom;
        const worldY = (mouseY - pan.y) / zoom;

        setZoom(() => {
            const nextZoom = Math.max(0.2, Math.min(5, d));
            
            setPan(() => {
                const newPanX = mouseX - worldX * nextZoom;
                const newPanY = mouseY - worldY * nextZoom;

                return {
                    x: newPanX,
                    y: newPanY
                };
            });
            
            return nextZoom;
        });

        event.preventDefault();
      },
      onWheel: ({ delta: [, dy], event }) => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Calculate world coordinates of mouse position before zoom
        const worldX = (mouseX - pan.x) / zoom;
        const worldY = (mouseY - pan.y) / zoom;

        setZoom(prevZoom => {
            const clampedDy = Math.max(-40, Math.min(40, dy));
            const zoomIntensity = 0.001;
            const factor = Math.exp(-clampedDy * zoomIntensity);
            const nextZoom = Math.max(0.2, Math.min(5, prevZoom * factor));
            
            setPan(() => {
                const newPanX = mouseX - worldX * nextZoom;
                const newPanY = mouseY - worldY * nextZoom;

                return {
                    x: newPanX,
                    y: newPanY
                };
            });
            
            return nextZoom;
        });
        
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

  return { pan, zoom, gestureHandlers };
}