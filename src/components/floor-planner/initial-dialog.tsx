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
import { Field, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { useFloor } from '@/contexts/floor-context';
import { Separator } from '../ui/separator';
import { Spinner } from '../ui/spinner';

function InitialDialog() {
  const [isOpen, setIsOpen] = useState(true);
  const { floor, saveFloor, isSavingFloor } = useFloor();

  const handleOpenChange = useCallback(
    async (open: boolean) => {
      await saveFloor();

      setIsOpen(open);

      // Remove initial query param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('initial');
      window.history.replaceState({}, '', url.toString());
    },
    [saveFloor]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome To Your New Floor!</DialogTitle>
          <DialogDescription>
            Get started by giving your floor a name. You can always change this
            later.
          </DialogDescription>
        </DialogHeader>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input value={floor.name} />
            </Field>
          </FieldGroup>
        </form>
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
            <Button className="cursor-pointer">
              {isSavingFloor ? <Spinner /> : null}
              Get started
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InitialDialog;
