import { Separator } from '@/components/ui/separator';
import { useFloorUI } from '@/contexts/floor-ui-context';
import DoorLockControl from './door-lock-control';
import { useFloors } from '@/contexts/floors-context';
import ThermostatControl from './thermostat-control';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import LightControl from './light-control';

function DeviceDetails() {
  const { selectedDeviceId } = useFloorUI();
  const { devices } = useFloors();

  const selectedDevice = devices?.find(d => d.id === selectedDeviceId);

  return (
    <>
      <p className="mb-6 text-muted-foreground text-body-sm -mt-2">
        {selectedDevice?.description || 'Manage your device below.'}
      </p>
      <Separator
        orientation="horizontal"
        className="mb-6 bg-border -mx-4 !w-auto"
      />

      {selectedDevice!.type === 'door-lock' && (
        <DoorLockControl device={selectedDevice!} />
      )}

      {selectedDevice!.type === 'thermostat' && (
        <ThermostatControl device={selectedDevice!} />
      )}

      {selectedDevice!.type === 'light' && (
        <LightControl device={selectedDevice!} />
      )}

      <Separator
        orientation="horizontal"
        className="my-6 bg-border -mx-4 !w-auto"
      />
      <h3 className="font-heading-2xs text-sm mb-3">Manage device</h3>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" className="cursor-pointer">
          <Pencil />
          Edit
        </Button>
        <Button variant="outline" className="cursor-pointer">
          <Trash />
          Remove
        </Button>
      </div>
    </>
  );
}

export default DeviceDetails;
