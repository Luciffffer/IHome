import { useState } from 'react';
import { IRoom } from '@/models/Room';
import { screenToWorld } from '../utils/coordinates';
import { GRID_SIZE, snapToGrid } from '../utils/grid';
import { CursorClass, DEFAULT_ROOM_COLORS } from '../floor-plan-editor';
import { useFloor } from '@/contexts/floor-context';

export function useDrawingMode(
    containerRef: React.RefObject<HTMLElement | null>,
    interactionMode: string,
    pan: { x: number; y: number },
    zoom: number,
    setCursorStyle: (style: CursorClass) => void
) {
    const { rooms, addRoom } = useFloor();

    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
    const [isValidPlacement, setIsValidPlacement] = useState(true);

    const checkOverlap = (rect1: { x: number; y: number; width: number; length: number }, 
                          rect2: { x: number; y: number; width: number; length: number }) => {
        return !(
            rect1.x + rect1.width <= rect2.x * GRID_SIZE ||
            rect1.x >= rect2.x * GRID_SIZE + rect2.width * GRID_SIZE ||
            rect1.y + rect1.length <= rect2.y * GRID_SIZE ||
            rect1.y >= rect2.y * GRID_SIZE + rect2.length * GRID_SIZE
        )
    };

    const checkCollisions = (rect: { x: number; y: number; width: number; length: number }) => {
        return rooms.some(room => checkOverlap(rect, room));
    };

    const handlePointerDown = (event: React.PointerEvent) => {
        if (interactionMode !== 'drawing' || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const worldPos = screenToWorld(x, y, pan, zoom);
        const snappedPos = {
            x: snapToGrid(worldPos.x),
            y: snapToGrid(worldPos.y),
        };

        setStartPoint(snappedPos);
        setCurrentPoint(snappedPos);
        setIsDrawing(true);
        setIsValidPlacement(true);
        setCursorStyle('cursor-crosshair');
    };

    const handlePointerMove = (event: React.PointerEvent) => {
        if (!isDrawing || interactionMode !== 'drawing' || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const worldPos = screenToWorld(x, y, pan, zoom);
        const snappedPos = {
            x: snapToGrid(worldPos.x),
            y: snapToGrid(worldPos.y),
        };

        setCurrentPoint(snappedPos);

        const minX = Math.min(startPoint!.x, snappedPos.x);
        const minY = Math.min(startPoint!.y, snappedPos.y);
        const width = Math.abs(snappedPos.x - startPoint!.x);
        const length = Math.abs(snappedPos.y - startPoint!.y);

        if (width > 0 && length > 0) {
            const hasCollision = checkCollisions({ x: minX, y: minY, width, length });
            setIsValidPlacement(!hasCollision);
        }
  };

  const handlePointerUp = (): IRoom | null => {
    if (!isDrawing || !startPoint || !currentPoint) return null;

    const minX = Math.min(startPoint.x, currentPoint.x);
    const minY = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const length = Math.abs(currentPoint.y - startPoint.y);

    let newRoom: IRoom | null = null;

    if (width > 0 && length > 0 && isValidPlacement) {
      newRoom = {
          id: `room-${Date.now()}`,
          x: minX / GRID_SIZE,
          y: minY / GRID_SIZE,
          width: width / GRID_SIZE,
          length: length / GRID_SIZE,
          name: 'New Room',
          color: DEFAULT_ROOM_COLORS[rooms.length % DEFAULT_ROOM_COLORS.length], 
        };
      
        addRoom(newRoom);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
    setIsValidPlacement(true);
    setCursorStyle('cursor-default');
    return newRoom;
  };

  return {
    rooms,
    isDrawing,
    startPoint,
    currentPoint,
    isValidPlacement,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}