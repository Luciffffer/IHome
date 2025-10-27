import { IRoom } from "@/models/Room";
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three';
import { FULL_WALL_HEIGHT, STUB_WALL_HEIGHT } from './constants';

export interface Edge {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
}

export interface Wall extends Edge {
  height: number;
  isExterior: boolean;
}

// Create a key for an edge (normalized so direction doesn't matter)
function edgeKey(x1: number, z1: number, x2: number, z2: number): string {
  const points = [
    [x1, z1],
    [x2, z2],
  ].sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));
  return `${points[0][0]},${points[0][1]}-${points[1][0]},${points[1][1]}`;
}

// Extract all edges from all rooms
export function extractAllEdges(rooms: IRoom[]): Edge[] {
  const edges: Edge[] = [];

  for (const room of rooms) {
    const { x, y, width, length } = room;
    for (let i = 0; i < width; i++) {
      // top edge
      edges.push({ x1: x + i, z1: y, x2: x + i + 1, z2: y });
      // bottom edge
      edges.push({ x1: x + i, z1: y + length, x2: x + i + 1, z2: y + length });
    }
    for (let i = 0; i < length; i++) {
      // left edge
      edges.push({ x1: x, z1: y + i, x2: x, z2: y + i + 1 });
      // right edge
      edges.push({ x1: x + width, z1: y + i, x2: x + width, z2: y + i + 1 });
    }
  }

  return edges;
}

// Get all walls from rooms, determining exterior vs interior and heights
export function generateWalls(rooms: IRoom[]): Wall[] {
  if (rooms.length === 0) return [];

  // Extract all 1-meter edge segments
  const allEdges = extractAllEdges(rooms);

  // Count occurrences of each edge
  const edgeCount = new Map<string, Edge[]>();

  for (const edge of allEdges) {
    const key = edgeKey(edge.x1, edge.z1, edge.x2, edge.z2);
    if (!edgeCount.has(key)) {
      edgeCount.set(key, []);
    }
    edgeCount.get(key)!.push(edge);
  }

  // Bottom walls + walls with a room above should always be stubs
  const stubOverwrite = new Set<string>();

  for (const room of rooms) {
    const { x, y, width, length } = room;
    const bottomZ = y + length;

    // Mark all edge segments along the bottom wall
    for (let i = 0; i < width; i++) {
      const key = edgeKey(x + i, bottomZ, x + i + 1, bottomZ);
      stubOverwrite.add(key);
    }

    // Check for rooms directly above the top wall
    const topZ = y;
    for (let i = 0; i < width; i++) {
      const wallX = x + i;
      const hasRoomAbove = rooms.some(
        r =>
          r.id !== room.id &&
          r.y + r.length < topZ &&
          wallX >= r.x &&
          wallX < r.x + r.width
      );
      if (hasRoomAbove) {
        const key = edgeKey(wallX, topZ, wallX + 1, topZ);
        stubOverwrite.add(key);
      }
    }
  }

  // Create walls based on edge count
  const walls: Wall[] = [];

  for (const [key, edges] of edgeCount.entries()) {
    const edge = edges[0];

    // Edge appears once = exterior wall (only one room has this edge)
    // Edge appears twice = interior wall (shared between two rooms)
    const isExterior = edges.length === 1;

    // Check if this is edge has an overwrite to be a stub wall
    const isStubOverwrite = stubOverwrite.has(key);

    const height = isStubOverwrite
      ? STUB_WALL_HEIGHT
      : isExterior
      ? FULL_WALL_HEIGHT
      : STUB_WALL_HEIGHT;

    walls.push({
      x1: edge.x1,
      z1: edge.z1,
      x2: edge.x2,
      z2: edge.z2,
      height,
      isExterior: isExterior && !isStubOverwrite,
    });
  }

  return walls;
}

// Create rectangle for wall segment with given half-thickness
export function rectForSegment(
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  halfThick: number
) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz) || 1;
  const nx = -dz / len;
  const nz = dx / len;
  // four corners (clockwise)
  return [
    [x1 + nx * halfThick, z1 + nz * halfThick],
    [x2 + nx * halfThick, z2 + nz * halfThick],
    [x2 - nx * halfThick, z2 - nz * halfThick],
    [x1 - nx * halfThick, z1 - nz * halfThick],
    [x1 + nx * halfThick, z1 + nz * halfThick], // close ring
  ];
}

// Extrude polygons into vertical geometries
export function polygonsToExtrudeGeometry(multiPoly: number[][][][], height: number) {
  const meshes: THREE.BufferGeometry[] = [];

  // compute signed area of a ring
  function signedArea(ring: number[][]) {
    let a = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const x0 = ring[i][0],
        z0 = -ring[i][1];
      const x1 = ring[i + 1][0],
        z1 = -ring[i + 1][1];
      a += x0 * z1 - x1 * z0;
    }
    return a / 2;
  }

  // Ensure ring winding is correct for Three.js shapes (outer vs holes)
  function orientRings(poly: number[][][]) {
    if (!poly || poly.length === 0) return poly;
    const outer = poly[0].slice();
    // Make outer have positive (CCW) area. If not, reverse it.
    if (signedArea(outer) < 0) outer.reverse();

    const holes: number[][][] = [];
    for (let r = 1; r < poly.length; r++) {
      const hole = poly[r].slice();
      // Holes should have opposite winding to outer
      if (signedArea(hole) > 0) hole.reverse();
      holes.push(hole);
    }
    return [outer, ...holes];
  }

  // each polygon is array of rings (outer + holes), coordinates [x,z]
  for (const poly of multiPoly) {
    const oriented = orientRings(poly);
    const outer = oriented[0];
    if (!outer || outer.length < 3) continue;

    const shape = new THREE.Shape();
    // map (x,z) -> (x, -z) to correct mirroring
    shape.moveTo(outer[0][0], -outer[0][1]);
    for (let i = 1; i < outer.length; i++)
      shape.lineTo(outer[i][0], -outer[i][1]);

    // holes
    for (let r = 1; r < oriented.length; r++) {
      const holeRing = oriented[r];
      if (!holeRing || holeRing.length < 3) continue;
      const holePath = new THREE.Path();
      holePath.moveTo(holeRing[0][0], -holeRing[0][1]);
      for (let i = 1; i < holeRing.length; i++)
        holePath.lineTo(holeRing[i][0], -holeRing[i][1]);
      shape.holes.push(holePath);
    }

    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: false,
      steps: 1,
    });

    // map extrude Z -> Y (make vertical)
    extrude.rotateX(-Math.PI / 2);

    // translate so base sits at Y = 0
    extrude.translate(0, height / 2, 0);

    extrude.computeVertexNormals();
    meshes.push(extrude);
  }

  // merge all extruded geometries into one
  return meshes.length > 0
    ? mergeGeometries(meshes)
    : new THREE.BufferGeometry();
}

// Extract top-facing triangles from geometry (for wall tops)
export function extractTopTriangles(geom: THREE.BufferGeometry, threshold = 0.9) {
  const topGeom = new THREE.BufferGeometry();

  if (!geom || !geom.attributes.position) return topGeom;

  // Ensure non-indexed
  const source = geom.index ? geom.toNonIndexed() : geom.clone();
  const posArr = source.attributes.position.array as Float32Array;
  const triCount = posArr.length / 9; // 3 verts * 3 components

  const topPositions: number[] = [];
  const topNormals: number[] = [];

  const v0 = new THREE.Vector3();
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i < triCount; i++) {
    const base = i * 9;
    v0.set(posArr[base], posArr[base + 1], posArr[base + 2]);
    v1.set(posArr[base + 3], posArr[base + 4], posArr[base + 5]);
    v2.set(posArr[base + 6], posArr[base + 7], posArr[base + 8]);

    cb.subVectors(v1, v0);
    ab.subVectors(v2, v0);
    normal.crossVectors(cb, ab).normalize();

    if (normal.y > threshold) {
      // add triangle positions
      topPositions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
      topNormals.push(
        normal.x,
        normal.y,
        normal.z,
        normal.x,
        normal.y,
        normal.z,
        normal.x,
        normal.y,
        normal.z
      );
    }
  }

  if (topPositions.length === 0) return topGeom;

  const positions = new Float32Array(topPositions);
  const normals = new Float32Array(topNormals);

  topGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  topGeom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  topGeom.computeBoundingSphere();

  return topGeom;
}

