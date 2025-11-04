'use client';

import { useFloors } from '@/contexts/floors';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useState } from 'react';
import { Button } from '../ui/button';
import { ChevronsUpDown, Pencil, Plus } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Spinner } from '../ui/spinner';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
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
} from '../ui/alert-dialog';

export function FloorSwitcher({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const {
    floors,
    currentFloor,
    setCurrentFloorIndex,
    floorsQueryStatus,
    createFloor,
    isCreatingFloor,
  } = useFloors();

  const session = useSession();
  const role = session.data?.user?.role || 'user';

  if (floorsQueryStatus === 'pending') {
    return <Skeleton className="w-36 h-9" />;
  }

  if (floorsQueryStatus === 'error') return null;

  if (floors.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1 items-center w-full justify-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full max-w-48 justify-between ${className}`}
          >
            <span className="truncate">{currentFloor?.name}</span>
            <ChevronsUpDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0">
          <Command>
            <CommandInput placeholder="Search floors..." />
            <CommandList>
              <CommandEmpty>No floors found.</CommandEmpty>
              <CommandGroup>
                {floors.map((floor, index) => (
                  <CommandItem
                    key={floor.id}
                    value={floor.id}
                    onSelect={currentValue => {
                      if (currentValue != currentFloor!.id) {
                        setCurrentFloorIndex(index);
                        setOpen(false);
                      }
                    }}
                  >
                    {floor.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {role === 'admin' && (
                <CommandGroup>
                  <CommandItem
                    onSelect={async () => {
                      await createFloor();
                      setOpen(false);
                    }}
                  >
                    {isCreatingFloor ? <Spinner /> : <Plus />}
                    Add Floor
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {role === 'admin' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Pencil />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Editing the floor plan will{' '}
                <strong className="text-primary">remove all the devices</strong>{' '}
                placed on this floor. You can re-add them once the new floor
                plan is saved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Link href={`/floor-planner/${currentFloor?.id}`}>
                  Edit Floor Plan
                </Link>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
