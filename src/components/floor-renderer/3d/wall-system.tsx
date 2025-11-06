import { IRoom } from '@/models/Room';
import { useMemo } from 'react';
import * as THREE from 'three';
import polygonClippingImport from 'polygon-clipping';
import {
  extractTopTriangles,
  generateWalls,
  polygonsToExtrudeGeometry,
  rectForSegment,
} from './utils/wall-geometry';
import { FLOOR_HEIGHT, WALL_THICKNESS } from './utils/constants';
import { frostedWallProps, topMaterialProps } from './utils/wall-materials';
import { useTheme } from 'next-themes';

interface PolygonClipping {
  union: (...polygons: number[][][][]) => number[][][][];
}

const polygonClipping = ((polygonClippingImport as { default?: unknown })
  .default ?? polygonClippingImport) as PolygonClipping;
type UnionFn = (...polygons: number[][][][]) => number[][][][];

interface WallSystemProps {
  rooms: IRoom[];
}

export function WallSystem({ rooms }: WallSystemProps) {
  const { resolvedTheme } = useTheme();

  const {
    exteriorGeometry,
    interiorGeometry,
    topExteriorGeometry,
    topInteriorGeometry,
  } = useMemo(() => {
    const walls = generateWalls(rooms);
    const half = WALL_THICKNESS / 2;

    // Create union shape for interior and exterior walls
    const exteriorRects: number[][][][] = [];
    const interiorRects: number[][][][] = [];

    for (const wall of walls) {
      const rect = rectForSegment(wall.x1, wall.z1, wall.x2, wall.z2, half);
      if (wall.isExterior) exteriorRects.push([rect]);
      else interiorRects.push([rect]);
    }

    // union rectangles into single polygon(s) per category
    const union = polygonClipping.union as UnionFn;

    const exteriorPoly =
      exteriorRects.length > 0 ? union(...exteriorRects) : [];
    const interiorPoly =
      interiorRects.length > 0 ? union(...interiorRects) : [];

    const exteriorMaxH = Math.max(
      ...walls.filter(w => w.isExterior).map(w => w.height),
      0.001
    );
    const interiorMaxH = Math.max(
      ...walls.filter(w => !w.isExterior).map(w => w.height),
      0.001
    );

    const exteriorGeom = polygonsToExtrudeGeometry(exteriorPoly, exteriorMaxH);
    const interiorGeom = polygonsToExtrudeGeometry(interiorPoly, interiorMaxH);

    // Move geometries up so base sits on floor
    if (exteriorGeom && exteriorGeom.attributes.position) {
      exteriorGeom.translate(0, -exteriorMaxH / 2 + FLOOR_HEIGHT, 0);
      exteriorGeom.computeVertexNormals();
    }
    if (interiorGeom && interiorGeom.attributes.position) {
      interiorGeom.translate(0, -interiorMaxH / 2 + FLOOR_HEIGHT, 0);
      interiorGeom.computeVertexNormals();
    }

    // extract top faces
    const topExteriorGeometry =
      exteriorGeom && exteriorGeom.attributes.position
        ? extractTopTriangles(exteriorGeom)
        : new THREE.BufferGeometry();
    const topInteriorGeometry =
      interiorGeom && interiorGeom.attributes.position
        ? extractTopTriangles(interiorGeom)
        : new THREE.BufferGeometry();

    return {
      exteriorGeometry: exteriorGeom,
      interiorGeometry: interiorGeom,
      topExteriorGeometry,
      topInteriorGeometry,
    };
  }, [rooms]);

  return (
    <group>
      {/* Exterior walls (full height) */}
      <mesh geometry={exteriorGeometry}>
        <meshPhysicalMaterial {...frostedWallProps(resolvedTheme)} />
      </mesh>

      {/* Solid tops for exterior walls */}
      {topExteriorGeometry && topExteriorGeometry.attributes.position && (
        <mesh
          geometry={topExteriorGeometry}
          renderOrder={100}
          position={[0, 0.001, 0]}
        >
          <meshBasicMaterial {...topMaterialProps(resolvedTheme)} />
        </mesh>
      )}

      {/* Interior walls (stub height) */}
      <mesh geometry={interiorGeometry}>
        <meshPhysicalMaterial {...frostedWallProps(resolvedTheme)} />
      </mesh>

      {/* Solid tops for exterior walls */}
      {topInteriorGeometry && topInteriorGeometry.attributes.position && (
        <mesh
          geometry={topInteriorGeometry}
          renderOrder={100}
          position={[0, 0.001, 0]}
        >
          <meshBasicMaterial {...topMaterialProps(resolvedTheme)} />
        </mesh>
      )}
    </group>
  );
}
