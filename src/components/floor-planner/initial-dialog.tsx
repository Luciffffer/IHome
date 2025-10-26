'use client';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useCallback, useState } from 'react';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../ui/field';
import { Input } from '../ui/input';
import { useFloor } from '@/contexts/floor-context';
import { Separator } from '../ui/separator';
import { Spinner } from '../ui/spinner';
import z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const initialSettingsSchema = z.object({
  name: z
    .string()
    .min(1, 'Floor name cannot be empty')
    .max(32, 'Floor name cannot exceed 32 characters'),
});

type initialSettingsFormData = z.infer<typeof initialSettingsSchema>;

function InitialDialog() {
  const [isOpen, setIsOpen] = useState(true);
  const { floor, saveFloor, isSavingFloor, updateFloorProperty } = useFloor();

  const form = useForm<initialSettingsFormData>({
    resolver: zodResolver(initialSettingsSchema),
    defaultValues: {
      name: floor.name,
    },
  });

  const handleFormSubmit = useCallback(
    async (data: initialSettingsFormData) => {
      updateFloorProperty('name', data.name);

      await saveFloor({ name: data.name });

      setIsOpen(false);

      // Remove initial query param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('initial');
      window.history.replaceState({}, '', url.toString());
    },
    [updateFloorProperty, saveFloor]
  );

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-3"
        >
          <DialogHeader>
            <DialogTitle>Welcome To Your New Floor!</DialogTitle>
            <DialogDescription>
              Get started by giving your floor a name. You can always change
              this later.
            </DialogDescription>
          </DialogHeader>
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
          <Separator className="-mx-6 my-3 !w-auto" />
          <p className="text-sm text-muted-foreground">
            The floor editor allows you to design and customize your floor plan.
            Use the pen tool to draw a room and then edit it!
          </p>
          <p className="text-sm text-muted-foreground">
            If you need help, click on the help icon in the toolbar.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="cursor-pointer" type="submit">
                {isSavingFloor ? <Spinner /> : null}
                Get started
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default InitialDialog;
