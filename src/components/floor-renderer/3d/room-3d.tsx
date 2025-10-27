import { IRoom } from '@/models/Room';
import { Text } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { FLOOR_HEIGHT } from './utils/constants';

function makeFloorGradient(color: string) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  // produce two brighter/tinted stops from the base color
  const base = new THREE.Color(color);
  const mid = base.clone().offsetHSL(0, 0.12, 0.12).getStyle();
  const bright = base.clone().offsetHSL(0, 0.18, 0.22).getStyle();
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, color);
  grad.addColorStop(0.5, mid);
  grad.addColorStop(1, bright);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, 1);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

interface Room3DProps {
  room: IRoom;
  allRooms: IRoom[];
  floorWidth: number;
  floorLength: number;
}

function Room3D({ room }: Room3DProps) {
  const width = room.width;
  const length = room.length;

  const posX = room.x + width / 2;
  const posZ = room.y + length / 2;

  const labelFontSize = useMemo(() => {
    const candidate = Math.min(width, length) * 0.18;
    return Math.max(0.25, Math.min(0.5, candidate));
  }, [width, length]);

  const gradientMap = useMemo(
    () => makeFloorGradient(room.color ?? '#ff7b7b'),
    [room.color]
  );

  return (
    <group>
      {/* Floor of the room */}
      <mesh position={[posX, FLOOR_HEIGHT, posZ]} receiveShadow>
        <boxGeometry args={[width, 0.1, length]} />
        <meshToonMaterial
          color={room.color}
          map={gradientMap}
          emissive={room.color}
          emissiveIntensity={0.08}
          toneMapped={true}
        />
      </mesh>

      <mesh
        position={[posX, FLOOR_HEIGHT + 0.01, posZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry
          args={[Math.max(0.6, Math.min(width, length) * 0.4), 32]}
        />
        <meshBasicMaterial
          color={room.color}
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      <Text
        position={[posX, FLOOR_HEIGHT + 0.1, posZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={labelFontSize}
        textAlign="center"
        fontWeight={500}
        color="#FFFFFF"
        fillOpacity={0.9}
        anchorX="center"
        anchorY="middle"
        maxWidth={Math.max(0.5, Math.min(width, length) - 0.5)}
      >
        {room.name}
      </Text>
    </group>
  );
}

export default Room3D;
