import {
  DoorLockState,
  IDevice,
  LightState,
  ThermostatState,
} from '@/models/Device';
import { Lightbulb, Thermometer, Lock, Volume2, LockOpen } from 'lucide-react';
import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useFloorUI } from '@/contexts/floor-ui-context';

interface Device3DProps {
  device: IDevice;
}

const DEVICE_HEIGHT = 0.05;

function Device3D({ device }: Device3DProps) {
  const { openDeviceDetail } = useFloorUI();

  const Icon = useMemo(() => {
    switch (device.type) {
      case 'light':
        return Lightbulb;
      case 'thermostat':
        return Thermometer;
      case 'door-lock': {
        const state = device.state as DoorLockState;
        if (state.locked) {
          return Lock;
        }
        return LockOpen;
      }
      case 'audio':
        return Volume2;
    }
  }, [device.type, device.state]);

  const color = useMemo(() => {
    switch (device.type) {
      case 'light': {
        const state = device.state as LightState;
        if (state.on) {
          return '#fbbf24';
        }
        return '#6b7280';
      }
      case 'thermostat': {
        const state = device.state as ThermostatState;
        if (state.temperature < 18) {
          return '#3b82f6';
        } else if (state.temperature <= 24) {
          return '#10b981';
        } else {
          return '#ef4444';
        }
      }
      case 'door-lock': {
        const state = device.state as DoorLockState;
        if (state.locked) {
          return '#3b82f6';
        }
        return '#10b981';
      }
      case 'audio':
        return '#8b5cf6';
    }
  }, [device.type, device.state]);

  return (
    <Html
      center
      position={[device.x, DEVICE_HEIGHT + 0.1, device.y]}
      style={{
        pointerEvents: 'auto',
        userSelect: 'none',
        transform: 'translate(-50%, -50%)',
      }}
      distanceFactor={10}
    >
      <div
        className="relative cursor-pointer"
        onClick={e => {
          e.stopPropagation();
          openDeviceDetail(device);
        }}
      >
        {/* Icon */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full 
            shadow-lg bg-white`}
        >
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
      </div>
    </Html>
  );
}

export default Device3D;
