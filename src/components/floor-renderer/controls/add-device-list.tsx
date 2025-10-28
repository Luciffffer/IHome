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
      className="absolute bottom-6 bg-white rounded-lg shadow-lg border border-gray-200 
        px-4 py-4 z-10"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Add Device</h3>
        <Button
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          onClick={closeAddDeviceMenu}
        >
          <X />
        </Button>
      </div>
      <ul className="flex gap-2">
        {deviceTemplates.map(({ type, label, icon: Icon, description }) => (
          <li key={type}>
            <button
              onClick={() => togglePlacingDevice(type)}
              className={cn(
                'flex flex-col items-center justify-center gap-2 p-3 rounded-md',
                'border-2 border-dashed w-24 h-20',
                placingDeviceType === type
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-300 hover:border-primary hover:bg-primary/5',
                'cursor-pointer transition-colors duration-200',
                'min-w-[80px]'
              )}
              title={description}
            >
              <Icon
                className={cn(
                  'w-6 h-6',
                  placingDeviceType === type ? 'text-primary' : 'text-gray-600'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  placingDeviceType === type ? 'text-primary' : 'text-gray-700'
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
