'use client';

import { Html } from '@react-three/drei';
import { Lightbulb, Lock, Thermometer, Volume2 } from 'lucide-react';
import { useFloorUI } from '../../../contexts/floor-ui-context';

function Device3DPending() {
  const { pendingDevice } = useFloorUI();

  if (!pendingDevice) return null;

  const Icon =
    pendingDevice.type === 'light'
      ? Lightbulb
      : pendingDevice.type === 'thermostat'
      ? Thermometer
      : pendingDevice.type === 'door-lock'
      ? Lock
      : Volume2;

  const color =
    pendingDevice.type === 'light'
      ? '#fbbf24'
      : pendingDevice.type === 'thermostat'
      ? '#ef4444'
      : pendingDevice.type === 'door-lock'
      ? '#3b82f6'
      : '#8b5cf6';

  return (
    <Html
      center
      position={[pendingDevice.x!, 0.1, pendingDevice.y!]}
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
        transform: 'translate(-50%, -50%)',
      }}
      distanceFactor={10}
    >
      <div className="relative">
        {/* Icon */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg 
            bg-muted`}
        >
          <Icon className="w-7 h-7 animate-pulse" style={{ color }} />
        </div>
      </div>
    </Html>
  );
}

export default Device3DPending;
