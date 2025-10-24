import { useState, useCallback } from 'react';
import { IRoom } from '@/models/Room';
import { screenToWorld } from '../utils/coordinates';
import { GRID_SIZE, snapToGrid } from '../utils/grid';
import { CanvasState } from '../floor-plan-editor';
import { useFloor } from '@/contexts/floor-context';

type ResizeHandle = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | null;

export function useSelection(
  containerRef: React.RefObject<HTMLElement | null>,
  canvasState: CanvasState,
  pan: { x: number; y: number },
  zoom: number,
  selectedRoomId: string | null,
  setResizingMode: (isResizing: boolean) => void,
  setMovingMode: (isMoving: boolean) => void,
  setSelectedRoomId: (roomId: string | null) => void
) {
  const [activeHandle, setActiveHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [tempRoom, setTempRoom] = useState<IRoom | null>(null);
  const { rooms, updateRoom } = useFloor();

  const isMoving = canvasState === 'moving';
  const isResizing = canvasState === 'resizing';
  
  // Get the currently selected room
  const selectedRoom = rooms.find(room => room.id === selectedRoomId) || null;

  const handlePointerDown = (event: React.PointerEvent): boolean => {
    if (!containerRef.current) return false;

    const rect = containerRef.current.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    
    const { x, y } = screenToWorld(screenX, screenY, pan, zoom);
    
    // Check if we're clicking on a resize handle of the selected room
    if (selectedRoom) {
      const handle = getResizeHandleAtPoint(x, y, selectedRoom, zoom);
      if (handle) {
        setResizingMode(true);
        setActiveHandle(handle);
        setDragStart({ x, y });
        setTempRoom({ ...selectedRoom });
        event.stopPropagation();
        return true;
      }
    }
    
    // Check if we're clicking on any room
    for (let i = rooms.length - 1; i >= 0; i--) {
      const room = rooms[i];
      if (isPointInRoom(x, y, room)) {
        if (room.id === selectedRoomId) {
            // Already selected, start moving
            setMovingMode(true);
            setDragStart({ x, y });
            setTempRoom({ ...room });
            event.stopPropagation();
            return true;
        } else {
            // Select this room
            setSelectedRoomId(room.id);
            event.stopPropagation();
            return true;
        }
      }
    }
    
    // If we got here, we didn't click on any room
    setSelectedRoomId(null);
    return false;
  };

  const handlePointerMove = (event: React.PointerEvent): boolean => {
    if (!containerRef.current || !dragStart) return false;

    const rect = containerRef.current.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    
    const { x, y } = screenToWorld(screenX, screenY, pan, zoom);
    
    if (isMoving && tempRoom) {
      // Calculate the delta from the start position
      const dx = snapToGrid(x - dragStart.x);
      const dy = snapToGrid(y - dragStart.y);
      
      // Update the temp room position
      setTempRoom({
        ...tempRoom,
        x: (selectedRoom!.x * GRID_SIZE + dx) / GRID_SIZE,
        y: (selectedRoom!.y * GRID_SIZE + dy) / GRID_SIZE
      });
    } else if (isResizing && tempRoom && activeHandle) {
      const newRoom = { ...tempRoom };
      
      switch (activeHandle) {
        case 'topLeft':
          newRoom.width = snapToGrid(tempRoom.x * GRID_SIZE + tempRoom.width * GRID_SIZE - x) / GRID_SIZE;
          newRoom.length = snapToGrid(tempRoom.y * GRID_SIZE + tempRoom.length * GRID_SIZE - y) / GRID_SIZE;
          newRoom.x = snapToGrid(x) / GRID_SIZE;
          newRoom.y = snapToGrid(y) / GRID_SIZE;
          break;
        case 'topRight':
          newRoom.width = snapToGrid(x - tempRoom.x * GRID_SIZE) / GRID_SIZE;
          newRoom.length = snapToGrid(tempRoom.y * GRID_SIZE + tempRoom.length * GRID_SIZE - y) / GRID_SIZE;
          newRoom.y = snapToGrid(y) / GRID_SIZE;
          break;
        case 'bottomLeft':
          newRoom.width = snapToGrid(tempRoom.x * GRID_SIZE + tempRoom.width * GRID_SIZE - x) / GRID_SIZE;
          newRoom.length = snapToGrid(y - tempRoom.y * GRID_SIZE) / GRID_SIZE;
          newRoom.x = snapToGrid(x) / GRID_SIZE;
          break;
        case 'bottomRight':
          newRoom.width = snapToGrid(x - tempRoom.x * GRID_SIZE) / GRID_SIZE;
          newRoom.length = snapToGrid(y - tempRoom.y * GRID_SIZE) / GRID_SIZE;
          break;
      }
      
      // Ensure minimum size
      if (newRoom.width >= 1 && newRoom.length >= 1) {
        setTempRoom(newRoom);
      }
    }

    return true;
  };

  const handlePointerUp = () => {
    if ((isMoving || isResizing) && tempRoom) {
      // Check for overlap with other rooms
      if (!hasOverlap(tempRoom, rooms)) {
        updateRoom(tempRoom.id, tempRoom);
      }
    }
    
    // Reset the state
    setMovingMode(false);
    setResizingMode(false);
    setActiveHandle(null);
    setDragStart(null);
    setTempRoom(null);
  };

  // Update room properties (name, color)
  const updateRoomProperty = useCallback((property: keyof IRoom, value: unknown) => {
    if (selectedRoomId) {
      updateRoom(selectedRoomId, { [property]: value } as Partial<IRoom>);
    }
  }, [selectedRoomId, updateRoom]);

  return {
    selectedRoom,
    tempRoom,
    isMoving,
    isResizing,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    updateRoomProperty
  };
}

// Check if a point is inside a room
const isPointInRoom = (x: number, y: number, room: IRoom) => {
  return x >= room.x * GRID_SIZE && x <= room.x * GRID_SIZE + room.width * GRID_SIZE && 
          y >= room.y * GRID_SIZE && y <= room.y * GRID_SIZE + room.length * GRID_SIZE;
};

// Check if a point is near a resize handle
const getResizeHandleAtPoint = (x: number, y: number, room: IRoom, zoom: number): ResizeHandle => {
  const handleSize = 10 / zoom; // Size of the handle in world coordinates
  
  // Check each corner
  if (Math.abs(x - room.x * GRID_SIZE) <= handleSize && Math.abs(y - room.y * GRID_SIZE) <= handleSize) {
    return 'topLeft';
  }
  if (Math.abs(x - (room.x * GRID_SIZE + room.width * GRID_SIZE)) <= handleSize && Math.abs(y - room.y * GRID_SIZE) <= handleSize) {
    return 'topRight';
  }
  if (Math.abs(x - room.x * GRID_SIZE) <= handleSize && Math.abs(y - (room.y * GRID_SIZE + room.length * GRID_SIZE)) <= handleSize) {
    return 'bottomLeft';
  }
  if (Math.abs(x - (room.x * GRID_SIZE + room.width * GRID_SIZE)) <= handleSize && 
      Math.abs(y - (room.y * GRID_SIZE + room.length * GRID_SIZE)) <= handleSize) {
    return 'bottomRight';
  }
  
  return null;
};

// Check if two rooms overlap
const checkOverlap = (room1: IRoom, room2: IRoom) => {
  return !(
    room1.x * GRID_SIZE + room1.width * GRID_SIZE <= room2.x * GRID_SIZE ||
    room1.x * GRID_SIZE >= room2.x * GRID_SIZE + room2.width * GRID_SIZE ||
    room1.y * GRID_SIZE + room1.length * GRID_SIZE <= room2.y * GRID_SIZE ||
    room1.y * GRID_SIZE >= room2.y * GRID_SIZE + room2.length * GRID_SIZE
  );
};

// Check if a room overlaps with any other room
const hasOverlap = (room: IRoom, rooms: IRoom[]) => {
  return rooms.some(r => r.id !== room.id && checkOverlap(room, r));
};
