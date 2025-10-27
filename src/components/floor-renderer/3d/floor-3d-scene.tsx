'use client';

import { useFloors } from '@/contexts/floors-context';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Room3D from './room-3d';
import { WallSystem } from './wall-system';
import GridOverlay from './grid-overlay';

function Floor3DScene() {
  const { currentFloor: floor } = useFloors();

  const centerX = floor!.width! / 2;
  const centerY = floor!.length! / 2;

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[centerX + 10, 15, centerY + 10]}
        fov={50}
      />
      <OrbitControls
        target={[centerX, 0, centerY]}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={50}
      />

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

      <GridOverlay x={0} z={0} width={floor!.width!} length={floor!.length!} />
    </>
  );
}

export default Floor3DScene;
