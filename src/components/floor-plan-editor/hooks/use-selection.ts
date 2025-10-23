import { useState, useCallback } from 'react';
import { IRoom } from '@/models/Room';
import { screenToWorld } from '../utils/coordinates';
import { GRID_SIZE, snapToGrid } from '../utils/grid';
import { CanvasState } from '../floor-plan-editor';

type ResizeHandle = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | null;

export function useSelection(
  containerRef: React.RefObject<HTMLElement | null>,
  canvasState: CanvasState,
  pan: { x: number; y: number },
  zoom: number,
  rooms: IRoom[],
  selectedRoomId: string | null,
  setRooms: React.Dispatch<React.SetStateAction<IRoom[]>>,
  setResizingMode: (isResizing: boolean) => void,
  setMovingMode: (isMoving: boolean) => void,
  setSelectedRoomId: (roomId: string | null) => void
) {
  const [activeHandle, setActiveHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [tempRoom, setTempRoom] = useState<IRoom | null>(null);

  const isMoving = canvasState === 'moving';
  const isResizing = canvasState === 'resizing';
  
  // Get the currently selected room
  const selectedRoom = rooms.find(room => room.objectId === selectedRoomId) || null;

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
        if (room.objectId === selectedRoomId) {
            // Already selected, start moving
            setMovingMode(true);
            setDragStart({ x, y });
            setTempRoom({ ...room });
            event.stopPropagation();
            return true;
        } else {
            // Select this room
            setSelectedRoomId(room.objectId);
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
        x: selectedRoom!.x + dx,
        y: selectedRoom!.y + dy
      });
    } else if (isResizing && tempRoom && activeHandle) {
      const newRoom = { ...tempRoom };
      
      switch (activeHandle) {
        case 'topLeft':
          newRoom.width = snapToGrid(tempRoom.x + tempRoom.width * GRID_SIZE - x) / GRID_SIZE;
          newRoom.length = snapToGrid(tempRoom.y + tempRoom.length * GRID_SIZE - y) / GRID_SIZE;
          newRoom.x = snapToGrid(x);
          newRoom.y = snapToGrid(y);
          break;
        case 'topRight':
          newRoom.width = snapToGrid(x - tempRoom.x) / GRID_SIZE;
          newRoom.length = snapToGrid(tempRoom.y + tempRoom.length * GRID_SIZE - y) / GRID_SIZE;
          newRoom.y = snapToGrid(y);
          break;
        case 'bottomLeft':
          newRoom.width = snapToGrid(tempRoom.x + tempRoom.width * GRID_SIZE - x) / GRID_SIZE;
          newRoom.length = snapToGrid(y - tempRoom.y) / GRID_SIZE;
          newRoom.x = snapToGrid(x);
          break;
        case 'bottomRight':
          newRoom.width = snapToGrid(x - tempRoom.x) / GRID_SIZE;
          newRoom.length = snapToGrid(y - tempRoom.y) / GRID_SIZE;
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
        // Apply the changes
        setRooms(prevRooms => 
          prevRooms.map(room => 
            room.objectId === tempRoom.objectId ? tempRoom : room
          )
        );
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
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.objectId === selectedRoomId ? { ...room, [property]: value } : room
        )
      );
    }
  }, [selectedRoomId, setRooms]);

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
  return x >= room.x && x <= room.x + room.width * GRID_SIZE && 
          y >= room.y && y <= room.y + room.length * GRID_SIZE;
};

// Check if a point is near a resize handle
const getResizeHandleAtPoint = (x: number, y: number, room: IRoom, zoom: number): ResizeHandle => {
  const handleSize = 10 / zoom; // Size of the handle in world coordinates
  
  // Check each corner
  if (Math.abs(x - room.x) <= handleSize && Math.abs(y - room.y) <= handleSize) {
    return 'topLeft';
  }
  if (Math.abs(x - (room.x + room.width * GRID_SIZE)) <= handleSize && Math.abs(y - room.y) <= handleSize) {
    return 'topRight';
  }
  if (Math.abs(x - room.x) <= handleSize && Math.abs(y - (room.y + room.length * GRID_SIZE)) <= handleSize) {
    return 'bottomLeft';
  }
  if (Math.abs(x - (room.x + room.width * GRID_SIZE)) <= handleSize && 
      Math.abs(y - (room.y + room.length * GRID_SIZE)) <= handleSize) {
    return 'bottomRight';
  }
  
  return null;
};

// Check if two rooms overlap
const checkOverlap = (room1: IRoom, room2: IRoom) => {
  return !(
    room1.x + room1.width * GRID_SIZE <= room2.x ||
    room1.x >= room2.x + room2.width * GRID_SIZE ||
    room1.y + room1.length * GRID_SIZE <= room2.y ||
    room1.y >= room2.y + room2.length * GRID_SIZE
  );
};

// Check if a room overlaps with any other room
const hasOverlap = (room: IRoom, rooms: IRoom[]) => {
  return rooms.some(r => r.objectId !== room.objectId && checkOverlap(room, r));
};
