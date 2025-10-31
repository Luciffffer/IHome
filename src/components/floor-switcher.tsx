'use client';

import { useFloors } from '@/contexts/floors';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronsUpDown, Plus } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Spinner } from './ui/spinner';

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

  if (floorsQueryStatus === 'pending') {
    return <Skeleton className="w-36 h-9" />;
  }

  if (floorsQueryStatus === 'error') return null;

  if (floors.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full max-w-48 justify-between ${className}`}
        >
          {currentFloor!.name}
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
