'use client';

import { useFloors } from '@/contexts/floors-context';
import Room3D from './room-3d';
import { WallSystem } from './wall-system';
import Camera from './camera';

function Floor3DScene() {
  const { currentFloor: floor } = useFloors();

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

      {/* <GridOverlay x={0} z={0} width={floor!.width!} length={floor!.length!} /> */}
    </>
  );
}

export default Floor3DScene;
