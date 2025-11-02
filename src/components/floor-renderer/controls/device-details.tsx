import { Separator } from '@/components/ui/separator';
import { useFloorUI } from '@/contexts/floor-ui-context';
import DoorLockControl from './door-lock-control';
import ThermostatControl from './thermostat-control';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import LightControl from './light-control';
import { useFloors } from '@/contexts/floors';
import AudioControl from './audio-control';
import { Spinner } from '@/components/ui/spinner';
import DeleteDialog from '@/components/delete-dialog';

function DeviceDetails() {
  const { selectedDeviceId, closeSideMenu, openDeviceEdit } = useFloorUI();
  const { devices, isDeletingDevice, deleteDevice } = useFloors();

  const selectedDevice = devices?.find(d => d.id === selectedDeviceId);

  if (!selectedDevice) {
    return (
      <div
        aria-label="loading"
        className="flex justify-center items-center py-12"
      >
        <Spinner className="w-9 h-9" />
      </div>
    );
  }

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

      {selectedDevice!.type === 'audio' && (
        <AudioControl device={selectedDevice!} />
      )}

      <Separator
        orientation="horizontal"
        className="my-6 bg-border -mx-4 !w-auto"
      />
      <h3 className="font-heading-2xs text-sm mb-3">Manage device</h3>
      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => openDeviceEdit(selectedDevice!)}
        >
          <Pencil />
          Edit
        </Button>
        <DeleteDialog
          onDelete={async () => {
            await deleteDevice(selectedDevice!.id);
            closeSideMenu();
          }}
          description="This action cannot be undone. This will permanently delete the device from our servers."
        >
          <Button variant="outline" className="cursor-pointer">
            {isDeletingDevice ? <Spinner /> : <Trash />}
            Delete
          </Button>
        </DeleteDialog>
      </div>
    </>
  );
}

export default DeviceDetails;
