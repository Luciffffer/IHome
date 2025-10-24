'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  SidePopupMenu,
  SidePopupMenuContent,
  SidePopupMenuHeader,
  SidePopupMenuTrigger,
} from '@/components/ui/side-popup-menu';
import { Spinner } from '@/components/ui/spinner';
import { useFloor } from '@/contexts/floor-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Settings, Trash } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';

const floorSettingsSchema = z.object({
  name: z
    .string()
    .min(1, 'Floor name cannot be empty')
    .max(32, 'Floor name cannot exceed 32 characters'),
});

type floorSettingsFormData = z.infer<typeof floorSettingsSchema>;

function SettingsPanel() {
  const {
    floor,
    updateFloorProperty,
    saveFloor,
    deleteFloor,
    isDeletingFloor,
    isSavingFloor,
  } = useFloor();

  const form = useForm<floorSettingsFormData>({
    resolver: zodResolver(floorSettingsSchema),
    defaultValues: {
      name: floor.name,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    form.setValue('name', floor.name);
  }, [floor.name, form]);

  const handleFieldChange = (
    field: keyof floorSettingsFormData,
    value: string
  ) => {
    const result = floorSettingsSchema.shape[field].safeParse(value);
    if (result.success) {
      updateFloorProperty(field, value);
    }
  };

  return (
    <SidePopupMenu>
      <SidePopupMenuTrigger>
        <Button
          variant="ghost"
          size="icon-lg"
          className="cursor-pointer *:[svg]:!w-5 *:[svg]:!h-5"
        >
          <Settings />
        </Button>
      </SidePopupMenuTrigger>
      <SidePopupMenuContent side="right" className="top-16 bottom-20">
        <SidePopupMenuHeader>
          <h2 className="font-heading-2xs">Floor Settings</h2>
        </SidePopupMenuHeader>
        <p className="mb-6 text-muted-foreground text-body-sm -mt-2">
          Adjust the general floor settings below.
        </p>
        <Separator
          orientation="horizontal"
          className="mb-6 bg-border -mx-4 !w-auto"
        />
        <form
          onSubmit={e => {
            e.preventDefault();
            saveFloor();
          }}
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Floor Name</FieldLabel>
                  <Input
                    {...field}
                    id="floor-name"
                    placeholder="Enter floor name"
                    aria-invalid={fieldState.invalid}
                    onChange={e => {
                      field.onChange(e);
                      handleFieldChange('name', e.target.value);
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  <FieldDescription>
                    Name of the floor (max 32 characters).
                  </FieldDescription>
                </Field>
              )}
            />
          </FieldGroup>
          <Button
            type="submit"
            variant="outline"
            className="cursor-pointer mt-6"
          >
            {isSavingFloor ? <Spinner /> : <Save />}
            Save Changes
          </Button>
        </form>
        <Separator
          orientation="horizontal"
          className="my-6 bg-border -mx-4 !w-auto"
        />
        <div>
          <h3 className="font-semibold font-body-sm mb-3">Delete Floor</h3>
          <p className="font-body-sm text-muted-foreground mb-6">
            Deleting a floor can&apos;t be undone. This action will permanently
            remove the floor and all its contents.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                {isDeletingFloor ? <Spinner /> : <Trash />}
                Delete Floor
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  floor and all its contents from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => {
                    deleteFloor();
                  }}
                >
                  <Trash />
                  Yes, Delete Floor
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidePopupMenuContent>
    </SidePopupMenu>
  );
}

export default SettingsPanel;
