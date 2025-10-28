import { DeviceType } from '@/models/Device';
import { IRoom } from '@/models/Room';
import * as THREE from 'three';

const WALL_SNAP_DISTANCE = 0.3; // units in 3D space

interface PlacementValidation {
  isValid: boolean;
  reason?: string;
  snappedPosition?: { x: number; z: number };
}

/**
 * Check if a point is near a wall segment
 */
function isNearWall(
  x: number,
  z: number,
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  snapDistance: number
): { isNear: boolean; snappedX?: number; snappedZ?: number } {
  // Calculate closest point on wall segment to (x, z)
  const wallVec = new THREE.Vector2(x2 - x1, z2 - z1);
  const pointVec = new THREE.Vector2(x - x1, z - z1);

  const wallLength = wallVec.length();
  if (wallLength === 0) return { isNear: false };

  const t = Math.max(
    0,
    Math.min(1, pointVec.dot(wallVec) / (wallLength * wallLength))
  );
  const closestX = x1 + t * (x2 - x1);
  const closestZ = z1 + t * (z2 - z1);

  const distance = Math.sqrt((x - closestX) ** 2 + (z - closestZ) ** 2);

  if (distance <= snapDistance) {
    return { isNear: true, snappedX: closestX, snappedZ: closestZ };
  }

  return { isNear: false };
}

/**
 * Check if a point is inside a room's bounds
 */
function isInRoom(x: number, z: number, room: IRoom): boolean {
  return (
    x >= room.x &&
    x <= room.x + room.width &&
    z >= room.y &&
    z <= room.y + room.length
  );
}

/**
 * Find which room contains a point
 */
export function findContainingRoom(
  x: number,
  z: number,
  rooms: IRoom[]
): IRoom | null {
  return rooms.find(room => isInRoom(x, z, room)) || null;
}

/**
 * Get all wall segments for a room
 */
function getRoomWalls(
  room: IRoom
): Array<{ x1: number; z1: number; x2: number; z2: number }> {
  const { x, y, width, length } = room;
  return [
    { x1: x, z1: y, x2: x + width, z2: y }, // top
    { x1: x + width, z1: y, x2: x + width, z2: y + length }, // right
    { x1: x + width, z1: y + length, x2: x, z2: y + length }, // bottom
    { x1: x, z1: y + length, x2: x, z2: y }, // left
  ];
}

/**
 * Validate device placement based on type and position
 */
export function validateDevicePlacement(
  deviceType: DeviceType,
  x: number,
  z: number,
  rooms: IRoom[]
): PlacementValidation {
  const room = findContainingRoom(x, z, rooms);

  if (!room) {
    return {
      isValid: false,
      reason: 'Device must be placed inside a room',
    };
  }

  switch (deviceType) {
    case 'door-lock': {
      // Door locks must be near a wall
      const walls = getRoomWalls(room);
      for (const wall of walls) {
        const { isNear, snappedX, snappedZ } = isNearWall(
          x,
          z,
          wall.x1,
          wall.z1,
          wall.x2,
          wall.z2,
          WALL_SNAP_DISTANCE
        );
        if (isNear && snappedX !== undefined && snappedZ !== undefined) {
          return {
            isValid: true,
            snappedPosition: { x: snappedX, z: snappedZ },
          };
        }
      }
      return {
        isValid: false,
        reason: 'Door locks must be placed on a wall',
      };
    }

    case 'light':
    case 'thermostat':
    case 'audio':
      // These can be placed anywhere in the room
      return { isValid: true };

    default:
      return { isValid: false, reason: 'Unknown device type' };
  }
}
