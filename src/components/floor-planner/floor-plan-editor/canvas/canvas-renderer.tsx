import { useEffect, useRef } from 'react';
import { IRoom } from '@/models/Room';
import { GRID_SIZE } from '../utils/grid';
import { drawRooms } from './draw-rooms';

interface CanvasRendererProps {
  canvasSize: { width: number; height: number };
  pan: { x: number; y: number };
  zoom: number;
  rooms: IRoom[];
  isDrawing: boolean;
  startPoint: { x: number; y: number } | null;
  currentPoint: { x: number; y: number } | null;
  isValidPlacement: boolean;
  selectedRoom: IRoom | null;
  tempRoom: IRoom | null;
}

export function CanvasRenderer({
  canvasSize,
  pan,
  zoom,
  rooms,
  isDrawing,
  startPoint,
  currentPoint,
  isValidPlacement,
  selectedRoom,
  tempRoom,
}: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    // Calculate visible bounds in world coordinates
    const left = -pan.x / zoom;
    const top = -pan.y / zoom;
    const right = left + canvas.width / zoom;
    const bottom = top + canvas.height / zoom;

    // Find first grid lines to draw
    const startX = Math.floor(left / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(top / GRID_SIZE) * GRID_SIZE;

    // Draw vertical grid lines
    for (let x = startX; x <= right; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let y = startY; y <= bottom; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }

    drawRooms(
      ctx,
      rooms,
      tempRoom,
      pan,
      zoom,
      isDrawing,
      startPoint,
      currentPoint,
      isValidPlacement,
      selectedRoom
    );

    ctx.restore();
  }, [
    pan,
    zoom,
    canvasSize,
    rooms,
    isDrawing,
    startPoint,
    currentPoint,
    isValidPlacement,
    selectedRoom,
    tempRoom,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      width={canvasSize.width}
      height={canvasSize.height}
    />
  );
}
