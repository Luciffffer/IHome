import * as THREE from 'three';

export const frostedWallProps = {
  color: "#ffffff",
  transparent: true,
  opacity: 0.96,
  transmission: 1,
  roughness: 0.7,
  thickness: 1,
  ior: 1.45,
  clearcoat: 0.3,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1
};

export const topMaterialProps = {
  color: "#ffffff",
  side: THREE.DoubleSide,
  depthWrite: true
};