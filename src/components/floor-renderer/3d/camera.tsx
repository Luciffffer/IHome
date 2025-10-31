'use client';

import { useFloors } from '@/contexts/floors';
import { PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFloorUI } from '../../../contexts/floor-ui-context';

function Camera() {
  const { viewMode, isAddDeviceMenuOpen, sideMenuOpen } = useFloorUI();
  const { currentFloor: floor } = useFloors();
  const { size, camera, gl, invalidate } = useThree();
  const [containerSize, setContainerSize] = useState({
    width: size.width,
    height: size.height,
  });

  const camRef = useRef<THREE.PerspectiveCamera | null>(null);

  // targets the camera will interpolate to
  const targetPos = useRef(new THREE.Vector3());
  const targetQuat = useRef(new THREE.Quaternion());

  const centerX = floor!.width! / 2;
  const centerY = floor!.length! / 2;

  // Calculate camera settings
  const { position2D, quat2D, position3D, quat3D, fov } = useMemo(() => {
    const floorW = floor!.width!;
    const floorL = floor!.length!;

    // choose a base distance based on FOV so the floor fills ~80% of view
    const fovDeg = 50;
    const fovRad = (fovDeg * Math.PI) / 180;
    const halfV = Math.tan(fovRad / 2);

    const canvasW = containerSize.width || size.width;
    const canvasH = containerSize.height || size.height;
    const aspect = canvasW / Math.max(1, canvasH);

    const verticalCoverage = isAddDeviceMenuOpen ? 0.75 : 0.8;
    const horizontalCoverage = sideMenuOpen ? 0.65 : 0.8;

    const requiredWorldHeight = floorL / verticalCoverage;
    const requiredWorldWidth = floorW / horizontalCoverage;

    const distanceForHeight = requiredWorldHeight / (2 * halfV);
    const distanceForWidth = requiredWorldWidth / (2 * halfV * aspect);

    const distanceBase = Math.max(distanceForHeight, distanceForWidth);

    const verticalOffset = isAddDeviceMenuOpen ? floorL * 0.1 : floorL * 0.05;
    const horizontalOffset = sideMenuOpen ? floorW * 0.15 : 0;

    const pos2D = new THREE.Vector3(
      centerX + horizontalOffset,
      distanceBase * 1.2,
      centerY + verticalOffset
    );
    const pos3D = new THREE.Vector3(
      centerX + horizontalOffset,
      distanceBase * 0.9,
      centerY + distanceBase * 0.7 + verticalOffset
    );

    // Look at center with offset
    const lookAtCenter = new THREE.Vector3(
      centerX + horizontalOffset,
      0,
      centerY + verticalOffset
    );

    // helper to compute quaternion that looks at center
    function lookQuat(from: THREE.Vector3, to: THREE.Vector3) {
      const m = new THREE.Matrix4();
      m.lookAt(from, to, new THREE.Vector3(0, 1, 0));
      const q = new THREE.Quaternion();
      q.setFromRotationMatrix(m);
      return q;
    }

    const q2D = lookQuat(pos2D, lookAtCenter);
    const q3D = lookQuat(pos3D, lookAtCenter);

    return {
      position2D: pos2D,
      quat2D: q2D,
      position3D: pos3D,
      quat3D: q3D,
      fov: fovDeg,
    };
  }, [
    floor,
    centerX,
    centerY,
    containerSize.width,
    containerSize.height,
    size.width,
    size.height,
    isAddDeviceMenuOpen,
    sideMenuOpen,
  ]);

  // initialize camera immediately on mount and when targets change
  useEffect(() => {
    if (viewMode === '3d') {
      targetPos.current.copy(position3D);
      targetQuat.current.copy(quat3D);
    } else {
      targetPos.current.copy(position2D);
      targetQuat.current.copy(quat2D);
    }

    // put camera immediately to target on first render to avoid blank frame
    const cam = camRef.current!;
    cam.position.copy(targetPos.current);
    cam.quaternion.copy(targetQuat.current);
    cam.fov = fov;
    cam.updateProjectionMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update targets when mode toggles
  useEffect(() => {
    if (viewMode === '3d') {
      targetPos.current.copy(position3D);
      targetQuat.current.copy(quat3D);
    } else {
      targetPos.current.copy(position2D);
      targetQuat.current.copy(quat2D);
    }
    (camera as THREE.PerspectiveCamera).fov = fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [viewMode, position2D, position3D, quat2D, quat3D, fov, camera]);

  // smooth interpolation each frame
  useFrame(() => {
    const cam = camRef.current!;
    cam.position.lerp(targetPos.current, 0.12);
    cam.quaternion.slerp(targetQuat.current, 0.12);
  });

  useEffect(() => {
    // ResizeObserver to detect canvas parent resizing
    const canvas = gl?.domElement;
    const parent = canvas?.parentElement ?? null;
    if (!parent) return;

    const ro = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      if (!rect) return;
      setContainerSize(prev => {
        if (prev.width === rect.width && prev.height === rect.height)
          return prev;
        return { width: rect.width, height: rect.height };
      });
      invalidate();
      camera.updateProjectionMatrix();
    });

    ro.observe(parent);
    ro.observe(canvas);

    return () => {
      ro.disconnect();
    };
  }, [gl, invalidate, camera]);

  return <PerspectiveCamera ref={camRef} makeDefault fov={fov} />;
}

export default Camera;
