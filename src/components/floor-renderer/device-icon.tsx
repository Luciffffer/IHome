import { cn } from '@/lib/utils';
import {
  AudioState,
  DoorLockState,
  IDevice,
  LightState,
  ThermostatState,
} from '@/models/Device';
import {
  Lightbulb,
  Lock,
  LockOpen,
  Thermometer,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useMemo } from 'react';

interface DeviceIconProps {
  device: IDevice;
  className?: string;
}

function DeviceIcon({ device, className }: DeviceIconProps) {
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
        const state = device.state as AudioState;
        if (state.volume === 0) {
          return VolumeX;
        }
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
        return 'var(--muted-foreground)';
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
        const state = device.state as AudioState;
        if (state.volume === 0) {
          return 'var(--muted-foreground)';
        }
        return '#8b5cf6';
    }
  }, [device.type, device.state]);

  return (
    <>
      <Icon style={{ color }} className={cn('w-6 h-6', className)} />
    </>
  );
}

export default DeviceIcon;
