import { IRoom } from '@/models/Room';
import { GRID_SIZE } from '../utils/grid';

export const drawRooms = (
  ctx: CanvasRenderingContext2D,
  rooms: IRoom[],
  tempRoom: IRoom | null,
  pan: { x: number; y: number },
  zoom: number,
  isDrawing: boolean,
  startPoint: { x: number; y: number } | null,
  currentPoint: { x: number; y: number } | null,
  isValidPlacement: boolean,
  selectedRoom: IRoom | null
) => {
  // Draw existing rooms
  ctx.lineWidth = 2 / zoom;

  rooms.forEach(room => {
    if (tempRoom && room.objectId === tempRoom.objectId) return; // skip temp room

    ctx.strokeStyle = 'rgba(180, 180, 180, 1)';
    ctx.fillStyle = room.color + '50'; // semi-transparent fill
    ctx.fillRect(
      room.x,
      room.y,
      room.width * GRID_SIZE,
      room.length * GRID_SIZE
    );
    ctx.strokeRect(
      room.x,
      room.y,
      room.width * GRID_SIZE,
      room.length * GRID_SIZE
    );

    // Draw room name in the center
    ctx.fillStyle = '#000';
    ctx.font = `${14 / zoom}px Inter, sans-serif`;
    ctx.fillText(
      room.name,
      room.x +
        (room.width * GRID_SIZE) / 2 -
        ctx.measureText(room.name).width / 2,
      room.y + (room.length * GRID_SIZE) / 2
    );
  });

  // Draw room being created
  if (isDrawing && startPoint && currentPoint) {
    const minX = Math.min(startPoint.x, currentPoint.x);
    const minY = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    // Use different colors based on validity
    if (isValidPlacement) {
      ctx.fillStyle = 'rgba(200, 230, 255, 0.3)';
      ctx.strokeStyle = '#0066cc';
    } else {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
      ctx.strokeStyle = '#cc0000';
    }

    ctx.lineWidth = 2 / zoom;
    ctx.fillRect(minX, minY, width, height);
    ctx.strokeRect(minX, minY, width, height);
  }

  // Draw temp room (during move/resize)
  if (tempRoom) {
    ctx.fillStyle = tempRoom.color + '50' || '#a0c4ff';
    ctx.strokeStyle = '#5d86c9';
    ctx.lineWidth = 2 / zoom;

    ctx.fillRect(
      tempRoom.x,
      tempRoom.y,
      tempRoom.width * GRID_SIZE,
      tempRoom.length * GRID_SIZE
    );
    ctx.strokeRect(
      tempRoom.x,
      tempRoom.y,
      tempRoom.width * GRID_SIZE,
      tempRoom.length * GRID_SIZE
    );

    // Draw room name
    if (tempRoom.name) {
      ctx.font = `${14 / zoom}px Arial`;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(
        tempRoom.name,
        tempRoom.x + (tempRoom.width * GRID_SIZE) / 2,
        tempRoom.y + (tempRoom.length * GRID_SIZE) / 2
      );
    }
  }

  // Highlight selected room
  if (selectedRoom) {
    const { x, y, width, length } = tempRoom || selectedRoom;

    ctx.strokeStyle = '#2563eb'; // Highlight color
    ctx.lineWidth = 3 / zoom;
    ctx.strokeRect(x, y, width * GRID_SIZE, length * GRID_SIZE);

    // Draw resize handles
    const handleSize = 10 / zoom;
    ctx.fillStyle = '#2563eb';

    // Top-left handle
    ctx.fillRect(
      x - handleSize / 2,
      y - handleSize / 2,
      handleSize,
      handleSize
    );

    // Top-right handle
    ctx.fillRect(
      x + width * GRID_SIZE - handleSize / 2,
      y - handleSize / 2,
      handleSize,
      handleSize
    );

    // Bottom-left handle
    ctx.fillRect(
      x - handleSize / 2,
      y + length * GRID_SIZE - handleSize / 2,
      handleSize,
      handleSize
    );

    // Bottom-right handle
    ctx.fillRect(
      x + width * GRID_SIZE - handleSize / 2,
      y + length * GRID_SIZE - handleSize / 2,
      handleSize,
      handleSize
    );

    // Draw dimensions in meter at top center and right center
    ctx.fillStyle = '#000';
    ctx.font = `${12 / zoom}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      `${width.toFixed(0)} m`,
      x + (width * GRID_SIZE) / 2,
      y + 24 / zoom
    );
    ctx.textAlign = 'right';
    ctx.fillText(
      `${length.toFixed(0)} m`,
      x + width * GRID_SIZE - 12 / zoom,
      y + (length * GRID_SIZE) / 2
    );
  }
};
