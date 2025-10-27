import Floor3DScene from './floor-3d-scene';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

function Floor3DRenderer() {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <Floor3DScene />
      </Canvas>
    </div>
  );
}

export default Floor3DRenderer;
