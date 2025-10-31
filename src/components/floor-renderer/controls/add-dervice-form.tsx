import { Separator } from '@/components/ui/separator';
import { useFloorUI } from '../../../contexts/floor-ui-context';
import z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useFloors } from '@/contexts/floors';
import { Spinner } from '@/components/ui/spinner';

const addDeviceSchema = z.object({
  name: z
    .string()
    .min(1, 'Device name cannot be empty')
    .max(32, 'Device name cannot exceed 32 characters'),
  upcCode: z.string().regex(/^\d{13}$/, 'UPC code must be a 13-digit number'),
  description: z.string().max(256, 'Description cannot exceed 256 characters'),
});

function AddDeviceForm() {
  const { pendingDevice, closeSideMenu, openDeviceDetail } = useFloorUI();
  const { createDevice, isCreatingDevice } = useFloors();

  const form = useForm({
    resolver: zodResolver(addDeviceSchema),
    defaultValues: {
      name: '',
      upcCode: '',
      description: '',
    },
  });

  useEffect(() => {
    form.reset();
  }, [pendingDevice, form]);

  const handleFormSubmit = async (data: z.infer<typeof addDeviceSchema>) => {
    if (!pendingDevice) return;

    const newDevice = {
      id: '', // ID will be assigned by the backend
      name: data.name,
      type: pendingDevice!.type!,
      upcCode: data.upcCode,
      roomId: pendingDevice!.roomId!,
      x: pendingDevice!.x!,
      y: pendingDevice!.y!,
      description: data.description,
    };

    const createdDevice = await createDevice(newDevice);
    openDeviceDetail(createdDevice);
  };

  return (
    <>
      <p className="mb-6 text-muted-foreground text-body-sm -mt-2">
        Fill in the details for the new device.
      </p>
      <Separator
        orientation="horizontal"
        className="mb-6 bg-border -mx-4 !w-auto"
      />
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-6"
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
        <Controller
          control={form.control}
          name="upcCode"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="mb-3">
              <FieldLabel>UPC Code</FieldLabel>
              <Input
                {...field}
                id="device-upc"
                placeholder="Enter device UPC code"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="mb-3">
              <FieldLabel>Device Description</FieldLabel>
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
        <div className="flex justify-end gap-3 *:hover:cursor-pointer">
          <Button variant="outline" onClick={closeSideMenu} type="button">
            Cancel
          </Button>
          <Button type="submit">
            {isCreatingDevice ? <Spinner /> : null}
            Add device
          </Button>
        </div>
      </form>
    </>
  );
}

export default AddDeviceForm;
