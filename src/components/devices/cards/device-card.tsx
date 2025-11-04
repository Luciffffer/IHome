import {
  AudioState,
  DoorLockState,
  IDevice,
  LightState,
  ThermostatState,
} from '@/models/Device';
import DeviceIcon from '../device-icon';

function summarizeState(device: IDevice): string {
  try {
    switch (device.type) {
      case 'thermostat': {
        const s = device.state as ThermostatState;
        const t = s.temperature;
        return `Set to ${t}°C`;
      }
      case 'light': {
        const s = device.state as LightState;
        return `${s.on ? 'On' : 'Off'} • ${s.brightness}%`;
      }
      case 'audio': {
        const s = device.state as AudioState;
        const vol = s.volume ?? 0;
        const pl = s.playlist;
        return pl ? `Vol ${vol} • ${String(pl)}` : `Vol ${vol}`;
      }
      case 'door-lock': {
        const s = device.state as DoorLockState;
        return s.locked ? 'Locked' : 'Unlocked';
      }
    }
  } catch {
    return 'No state';
  }
}

function DeviceCard({
  device,
  onOpen,
}: {
  device: IDevice;
  onOpen?: (d: IDevice) => void;
}) {
  const summary = summarizeState(device);

  return (
    <button
      type="button"
      onClick={() => onOpen?.(device)}
      className="group text-left rounded-lg border border-border 
        bg-card hover:bg-accent/30 transition-colors shadow-sm 
        hover:shadow p-4 focus:outline-none focus:ring-2 focus:ring-ring
        cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-md border border-border/70 bg-muted/40 p-2">
          <DeviceIcon device={device} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium truncate">
              {device.name ?? 'Unnamed device'}
            </div>
          </div>
          {device.description ? (
            <div className="text-muted-foreground text-sm truncate mt-0.5">
              {device.description}
            </div>
          ) : null}
          <div className="text-xs mt-2 text-foreground/80">{summary}</div>
        </div>
      </div>
    </button>
  );
}

export default DeviceCard;
