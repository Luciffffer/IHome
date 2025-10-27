import { useMemo } from 'react';
import * as THREE from 'three';

interface GridOverlayProps {
  x: number;
  z: number;
  width: number;
  length: number;
  y?: number;
}

function GridOverlay({ x, z, width, length, y = 0.21 }: GridOverlayProps) {
  const gridLines = useMemo(() => {
    const points: THREE.Vector3[] = [];

    // Vertical lines
    for (let i = 0; i <= width; i++) {
      points.push(new THREE.Vector3(x + i, y, z));
      points.push(new THREE.Vector3(x + i, y, z + length));
    }

    // Horizontal lines
    for (let j = 0; j <= length; j++) {
      points.push(new THREE.Vector3(x, y, z + j));
      points.push(new THREE.Vector3(x + width, y, z + j));
    }

    return points;
  }, [x, z, width, length, y]);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(gridLines);
    return geom;
  }, [gridLines]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#666666" opacity={0.3} transparent />
    </lineSegments>
  );
}

export default GridOverlay;
