import { IDevice } from '@/models/Device';
import { Lightbulb, Thermometer, Lock, Volume2 } from 'lucide-react';
import { useMemo } from 'react';
import { Html } from '@react-three/drei';

interface Device3DProps {
  device: IDevice;
  key: string;
}

const DEVICE_HEIGHT = 0.05;

function Device3D({ device, key }: Device3DProps) {
  const Icon = useMemo(() => {
    switch (device.type) {
      case 'light':
        return Lightbulb;
      case 'thermostat':
        return Thermometer;
      case 'door-lock':
        return Lock;
      case 'audio':
        return Volume2;
    }
  }, [device.type]);

  const color = useMemo(() => {
    switch (device.type) {
      case 'light':
        return '#fbbf24';
      case 'thermostat':
        return '#ef4444';
      case 'door-lock':
        return '#3b82f6';
      case 'audio':
        return '#8b5cf6';
    }
  }, [device.type]);

  return (
    <Html
      center
      position={[device.x, DEVICE_HEIGHT + 0.1, device.y]}
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
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-white`}
        >
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
      </div>
    </Html>
  );
}

export default Device3D;
