import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useFloorUI } from '@/contexts/floor-ui-context';
import { useFloors } from '@/contexts/floors';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const editDeviceSchema = z.object({
  name: z
    .string()
    .min(1, 'Device name cannot be empty')
    .max(32, 'Device name cannot exceed 32 characters'),
  description: z.string().max(256, 'Description cannot exceed 256 characters'),
});

function EditDeviceForm() {
  const { selectedDeviceId, closeSideMenu, openDeviceDetail } = useFloorUI();
  const { devices, isUpdatingDevice, updateDevice } = useFloors();

  const device = useMemo(
    () => devices.find(d => d.id === selectedDeviceId),
    [devices, selectedDeviceId]
  );

  const form = useForm({
    resolver: zodResolver(editDeviceSchema),
    defaultValues: {
      name: device?.name || '',
      description: device?.description || '',
    },
  });

  useEffect(() => {
    if (selectedDeviceId && !device) {
      closeSideMenu();
    }
  }, [selectedDeviceId, device, closeSideMenu]);

  useEffect(() => {
    form.reset({
      name: device?.name || '',
      description: device?.description || '',
    });
  }, [device, form]);

  const submitForm = async (data: z.infer<typeof editDeviceSchema>) => {
    if (!device) return;

    const updatedDevice = await updateDevice(device.id, {
      name: data.name,
      description: data.description,
    });

    if (!updatedDevice) return;
    toast.success('Device updated successfully');
    openDeviceDetail(updatedDevice);
  };

  return (
    <>
      <p className="mb-6 text-muted-foreground text-body-sm -mt-2">
        Edit the details of the selected device below.
      </p>
      <Separator
        orientation="horizontal"
        className="mb-6 bg-border -mx-4 !w-auto"
      />
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(submitForm)}
      >
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="mb-3">
              <FieldLabel>Device Name</FieldLabel>
              <Input
                {...field}
                id="device-name"
                placeholder="Enter device name"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field data-disabled={true} className="cursor-not-allowed">
          <FieldLabel>UPC Code</FieldLabel>
          <Input id="device-upc" disabled value={device!.upcCode} />
        </Field>
        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="mb-3">
              <FieldLabel className="flex items-center justify-between">
                <span>Device Description</span>
                <span className="text-muted-foreground font-body-xs">
                  (optional)
                </span>
              </FieldLabel>
              <Textarea
                {...field}
                id="device-description"
                placeholder="Enter device description"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Separator
          orientation="horizontal"
          className="bg-border -mx-4 !w-auto"
        />
        <p className="text-body-sm text-muted-foreground">
          If you wish to change the device type, UPC code, or position, please
          delete the device and create a new one.
        </p>
        <Separator
          orientation="horizontal"
          className="bg-border -mx-4 !w-auto"
        />
        <div className="flex justify-end gap-3 *:hover:cursor-pointer">
          <Button
            variant="outline"
            type="button"
            onClick={() => openDeviceDetail(device!)}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isUpdatingDevice ? <Spinner /> : <Save />}
            Save
          </Button>
        </div>
      </form>
    </>
  );
}

export default EditDeviceForm;
