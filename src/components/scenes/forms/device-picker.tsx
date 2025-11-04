'use client';

import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { Controller, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Plus, Search, X } from 'lucide-react';
import { PopoverContent } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { IDevice } from '@/models/Device';
import { Badge } from '@/components/ui/badge';

interface DevicePickerProps {
  form: UseFormReturn<{
    devices: string[];
  }>;
}

async function fetchAllDevices(): Promise<IDevice[]> {
  const res = await fetch('/api/devices');
  if (!res.ok) throw new Error('Failed to fetch devices');
  return (await res.json()).data;
}

function DevicePicker({ form }: DevicePickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  // Fetch all devices from api (all floors)
  const { data: devices = [], status: devicesStatus } = useQuery({
    queryKey: ['all-devices'],
    queryFn: fetchAllDevices,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Devices</label>

      {devicesStatus === 'pending' && (
        <Skeleton className="h-10 w-full rounded-md" />
      )}

      {devicesStatus === 'success' && (
        <Controller
          control={form.control}
          name="devices"
          render={({ field }) => {
            const selectedIds = field.value || [];
            const addDevice = (id: string) => {
              if (!selectedIds.includes(id)) {
                field.onChange([...selectedIds, id]);
              }
            };
            const removeDevice = (id: string) => {
              field.onChange(selectedIds.filter((x: string) => x !== id));
            };

            return (
              <div className="flex flex-col gap-2">
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Add devices…
                      </span>
                      <ChevronsUpDown className="h-4 w-4 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search devices…" />
                      <CommandList>
                        <CommandEmpty>No devices found.</CommandEmpty>
                        <CommandGroup heading="Devices">
                          {devices.map(d => {
                            const disabled = selectedIds.includes(d.id);
                            return (
                              <CommandItem
                                key={d.id}
                                value={`${d.name ?? 'unnamed'} ${d.type ?? ''}`}
                                onSelect={() => {
                                  addDevice(d.id);
                                }}
                                disabled={disabled}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="min-w-0">
                                    <div className="text-sm truncate">
                                      {d.name ?? 'Unnamed device'}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {(d.type ?? 'device').toString()}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="shrink-0"
                                    disabled={disabled}
                                    onClick={e => {
                                      e.stopPropagation();
                                      addDevice(d.id);
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Selected devices list */}
                {selectedIds.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-xs text-muted-foreground">
                      Selected: {selectedIds.length}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedIds.map((id: string) => {
                        const d = devices.find(d => d.id === id);
                        return (
                          <Badge
                            key={id}
                            variant="outline"
                            className="py-1 hover:bg-muted transition-colors cursor-pointer"
                            onClick={() => removeDevice(id)}
                          >
                            {d?.name ?? 'Unnamed device'}
                            <button
                              type="button"
                              className="cursor-pointer"
                              aria-label="Remove selected device"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No devices selected.
                  </div>
                )}

                {form.formState.errors.devices && (
                  <div className="text-xs text-destructive">
                    {form.formState.errors.devices.message as string}
                  </div>
                )}
              </div>
            );
          }}
        />
      )}
    </div>
  );
}

export default DevicePicker;
