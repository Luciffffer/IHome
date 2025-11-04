'use client';

import { DeviceType } from '@/models/Device';
import { Lightbulb, Thermometer, Lock, Volume2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFloorUI } from '../../../contexts/floor-ui-context';
import { Button } from '@/components/ui/button';

interface DeviceTemplate {
  type: DeviceType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const deviceTemplates: DeviceTemplate[] = [
  {
    type: 'light',
    label: 'Light',
    icon: Lightbulb,
    description: 'Smart lighting control',
  },
  {
    type: 'thermostat',
    label: 'Thermostat',
    icon: Thermometer,
    description: 'Temperature control',
  },
  {
    type: 'door-lock',
    label: 'Door Lock',
    icon: Lock,
    description: 'Smart door lock',
  },
  {
    type: 'audio',
    label: 'Audio',
    icon: Volume2,
    description: 'Smart speaker/audio',
  },
];

function AddDeviceList() {
  const { placingDeviceType, togglePlacingDevice, closeAddDeviceMenu } =
    useFloorUI();

  return (
    <nav
      className="absolute bottom-6 bg-background rounded-lg shadow-lg border border-muted 
        px-4 py-4 z-10 mx-6 max-w-full"
      aria-label="Add device menu"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-foreground">Add Device</h3>
        <Button
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          aria-label="Close add device menu"
          onClick={closeAddDeviceMenu}
        >
          <X />
        </Button>
      </div>
      <ul className="flex gap-2 overflow-x-scroll">
        {deviceTemplates.map(({ type, label, icon: Icon, description }) => (
          <li key={type}>
            <button
              onClick={() => togglePlacingDevice(type)}
              className={cn(
                'flex flex-col items-center justify-center gap-2 p-3 rounded-md',
                'border-2 border-dashed w-24 h-20',
                placingDeviceType === type
                  ? 'border-primary bg-primary/10'
                  : 'border-muted-foreground hover:border-primary hover:bg-primary/5',
                'cursor-pointer transition-colors duration-200',
                'min-w-[80px]'
              )}
              title={description}
            >
              <Icon
                className={cn(
                  'w-6 h-6',
                  placingDeviceType === type
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  placingDeviceType === type
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default AddDeviceList;
