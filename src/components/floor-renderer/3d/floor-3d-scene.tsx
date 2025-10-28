'use client';

import { useFloors } from '@/contexts/floors-context';
import Room3D from './room-3d';
import { WallSystem } from './wall-system';
import Camera from './camera';
import { toast } from 'sonner';
import { ThreeEvent } from '@react-three/fiber';
import {
  findContainingRoom,
  validateDevicePlacement,
} from '../utils/device-placement';
import Device3D from './device-3d';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFloorUI } from '../../../contexts/floor-ui-context';
import DevicePreview from './device-3d-preview';
import { IDevice } from '@/models/Device';
import Device3DPending from './device-3d-pending';

// Snap coordinate to grid (1x1 blocks, center of each block)
function snapToGrid(value: number): number {
  return Math.floor(value) + 0.5;
}

function Floor3DScene() {
  const { currentFloor: floor, devices } = useFloors();
  const { placingDeviceType, cancelPlacingDevice, openDeviceForm } =
    useFloorUI();

  const [previewPosition, setPreviewPosition] = useState<
    [number, number, number] | null
  >(null);
  const [isValidPlacement, setIsValidPlacement] = useState(false);
  const planeRef = useRef<THREE.Mesh>(null);

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!placingDeviceType || !floor) {
      setPreviewPosition(null);
      return;
    }

    // Get pointer position on the floor plane
    const point = event.point;

    // Snap to grid (center of 1x1 blocks)
    let snappedX = snapToGrid(point.x);
    let snappedZ = snapToGrid(point.z);

    // Validate placement
    const validation = validateDevicePlacement(
      placingDeviceType,
      snappedX,
      snappedZ,
      floor.rooms ?? []
    );

    // If device needs wall snapping (door lock), use snapped position
    if (validation.snappedPosition) {
      snappedX = validation.snappedPosition.x;
      snappedZ = validation.snappedPosition.z;
    }

    setPreviewPosition([snappedX, 0.05, snappedZ]);
    setIsValidPlacement(validation.isValid);
  };

  const handlePointerLeave = () => {
    setPreviewPosition(null);
  };

  const handleFloorClick = () => {
    if (!placingDeviceType || !floor || !previewPosition || !isValidPlacement) {
      if (!isValidPlacement && placingDeviceType) {
        toast.error('Cannot place device here');
      }
      return;
    }

    const [x, _, z] = previewPosition;

    const containingRoom = findContainingRoom(x, z, floor.rooms ?? []);
    if (!containingRoom) {
      toast.error('Device must be placed inside a room');
      return;
    }

    const pendingDevice: Partial<IDevice> = {
      type: placingDeviceType,
      x: x,
      y: z,
      roomId: containingRoom.id,
    };

    // Reset placement mode
    cancelPlacingDevice();
    setPreviewPosition(null);
    openDeviceForm(pendingDevice);
    toast.success('Device placed successfully');
  };

  return (
    <>
      <Camera />

      {/* Lighting */}
      <hemisphereLight groundColor="#ffd8d0" intensity={0.35} />
      <directionalLight
        color="#ffd7b5"
        intensity={0.9}
        position={[5, 10, 5]}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        color="#9be7ff"
        intensity={0.35}
        position={[-6, 6, -4]}
      />

      {/* Clickable floor plane for device placement */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[floor!.width! / 2, 0, floor!.length! / 2]}
        onClick={handleFloorClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        ref={planeRef}
        visible={false} // invisible but still receives clicks
      >
        <planeGeometry args={[floor!.width!, floor!.length!]} />
        <meshBasicMaterial />
      </mesh>

      {/* Render all rooms */}
      {floor!.rooms?.map(room => (
        <Room3D
          key={room.id}
          room={room}
          allRooms={floor!.rooms}
          floorWidth={floor!.width!}
          floorLength={floor!.length!}
        />
      ))}

      {/* Render all walls */}
      <WallSystem rooms={floor!.rooms ?? []} />

      {/* Render all devices */}
      {devices.map(device => (
        <Device3D key={device.id} device={device} />
      ))}

      {/* Device placement preview */}
      {placingDeviceType && previewPosition && (
        <DevicePreview
          type={placingDeviceType}
          position={previewPosition}
          isValid={isValidPlacement}
        />
      )}

      <Device3DPending />
    </>
  );
}

export default Floor3DScene;
