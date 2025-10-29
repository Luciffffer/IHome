import { Button } from '@/components/ui/button';
import { useFloors } from '@/contexts/floors-context';
import { DoorLockState, IDevice } from '@/models/Device';
import { Lock, LockOpen } from 'lucide-react';

interface DoorLockControlProps {
  device: IDevice;
}

function DoorLockControl({ device }: DoorLockControlProps) {
  const { queueDeviceUpdate } = useFloors();
  const deviceState =
    (device.state as DoorLockState) ?? ({ locked: false } as DoorLockState);
  const isLocked = Boolean(deviceState.locked);

  const toggle = () => {
    queueDeviceUpdate(device.id, {
      state: { ...(device.state ?? {}), locked: !isLocked } as DoorLockState,
    });
  };

  const setLocked = (locked: boolean) => {
    if (locked === isLocked) return;
    queueDeviceUpdate(device.id, {
      state: { ...(device.state ?? {}), locked } as DoorLockState,
    });
  };

  const ringClasses = 'ring-1 ring-border shadow-sm';
  const baseCircle =
    'relative w-44 h-44 rounded-full flex items-center justify-center transition-all duration-300';
  const stateBg = isLocked
    ? 'bg-gradient-to-br from-rose-400 to-rose-600'
    : 'bg-gradient-to-br from-emerald-400 to-emerald-600';
  const stateGlow = isLocked
    ? '0 0 40px 8px rgba(244, 63, 94, 0.25)'
    : '0 0 40px 8px rgba(16, 185, 129, 0.25)';

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        type="button"
        role="switch"
        aria-checked={isLocked}
        aria-label={isLocked ? 'Unlock door' : 'Lock door'}
        onClick={toggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        className="group focus:outline-none focus-visible:ring-2 
          focus-visible:ring-primary/60 rounded-full cursor-pointer"
      >
        <div
          className={`${baseCircle} ${stateBg} ${ringClasses} group-active:scale-95`}
          style={{ boxShadow: stateGlow }}
        >
          <div className="absolute inset-2 rounded-full border border-white/25" />
          {isLocked ? (
            <Lock className="w-14 h-14 text-white drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <LockOpen className="w-14 h-14 text-white drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
          )}
        </div>
      </button>

      <div className="flex flex-col items-center gap-2">
        <div className="text-muted-foreground text-sm">Door status</div>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            isLocked
              ? 'bg-rose-100 text-rose-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isLocked ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          />
          {isLocked ? 'Locked' : 'Unlocked'}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={() => setLocked(true)}
          className={`cursor-pointer transition-colors ${
            isLocked
              ? 'bg-rose-600 text-white'
              : 'border border-border hover:bg-rose-50 text-foreground'
          }`}
        >
          Lock
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={() => setLocked(false)}
          className={`cursor-pointer transition-colors ${
            !isLocked
              ? 'bg-emerald-600 text-white'
              : 'border border-border hover:bg-emerald-50 text-foreground'
          }`}
        >
          Unlock
        </Button>
      </div>
    </div>
  );
}

export default DoorLockControl;
