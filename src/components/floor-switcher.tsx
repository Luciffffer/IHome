'use client';

import { useFloors } from '@/contexts/floors-context';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronsUpDown } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function FloorSwitcher({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { floors, currentFloor, setCurrentFloorIndex, isLoading, error } =
    useFloors();

  if (isLoading) {
    return <Skeleton className="w-36 h-9" />;
  }

  if (error) return <></>;

  if (floors.length === 0) {
    return <></>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-36 justify-between ${className}`}
        >
          {currentFloor?.name}
          <ChevronsUpDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-36">test test test</PopoverContent>
    </Popover>
  );
}
