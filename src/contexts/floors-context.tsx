'use client';

import { queryClient } from '@/components/react-query-provider';
import { IDevice } from '@/models/Device';
import { IFloor } from '@/models/Floor';
import { QueryStatus, useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

interface FloorsContextValue {
  // floor data
  floors: IFloor[];
  currentFloorIndex: number;
  currentFloor: IFloor | null;

  // Device data
  devices: IDevice[];

  // loading states
  floorsQueryStatus: QueryStatus;
  devicesQueryStatus: QueryStatus;
  isCreatingFloor: boolean;
  isCreatingDevice: boolean;

  // actions
  setCurrentFloorIndex: (index: number) => void;
  refreshFloors: () => Promise<void>;
  createFloor: () => Promise<void>;
  createDevice: (device: Partial<IDevice>) => void;
  updateDevice: (
    deviceId: string,
    updates: Partial<IDevice>
  ) => Promise<IDevice>;

  // Debounced writes
  queueDeviceUpdate: (deviceId: string, updates: Partial<IDevice>) => void;
  flushDeviceUpdates: (deviceId: string) => Promise<void>;
}

const FloorsContext = createContext<FloorsContextValue | undefined>(undefined);

interface FloorsProviderProps {
  children: ReactNode;
}

export function FloorsProvider({ children }: FloorsProviderProps) {
  const DEVICE_UPDATE_DEBOUNCE_MS = 1000;

  const pendingUpdatesRef = useRef<
    Map<string, { timer: number | null; updates: Partial<IDevice> }>
  >(new Map());

  const router = useRouter();

  // Use URL state or session storage to persist current floor index
  const [currentFloorIndex, setCurrentFloorIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('currentFloorIndex');
      return stored ? parseInt(stored, 10) : 0;
    }
    return 0;
  });

  const handleSetCurrentFloorIndex = (index: number) => {
    setCurrentFloorIndex(index);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentFloorIndex', index.toString());
    }
  };

  // fetch floors from API

  const {
    data: floors = [],
    status: floorsQueryStatus,
    refetch: refreshFloors,
  } = useQuery({
    queryKey: ['floors'],
    queryFn: async () => {
      const response = await fetch('/api/floors');
      if (!response.ok) {
        throw new Error(`Failed to fetch floors: ${response.statusText}`);
      }
      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch floors');
      }
      return json.data as IFloor[];
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const currentFloor = floors[currentFloorIndex] ?? null;

  // Auto adjust index if out of bounds
  useEffect(() => {
    if (floors.length > 0 && currentFloorIndex >= floors.length) {
      setCurrentFloorIndex(0);
    }
  }, [floors, currentFloorIndex]);

  // fetch devices for the current floor

  const { data: devices = [], status: devicesQueryStatus } = useQuery({
    queryKey: ['devices', currentFloor?.id],
    queryFn: async () => {
      if (!currentFloor) return [];

      const response = await fetch(`/api/devices?floorId=${currentFloor.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.statusText}`);
      }
      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch devices');
      }
      return json.data as IDevice[];
    },
    enabled: !!currentFloor?.id,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // create a new floor with a temporary name

  const createFloorMutation = useMutation({
    mutationFn: async () => {
      const tempName = `Floor ${floors.length + 1}`;
      const response = await fetch('api/floors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempName }),
      });

      if (!response.ok)
        throw new Error(`Failed to create floor: ${response.statusText}`);

      const json = await response.json();
      return json.data as IFloor;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['floors'] });
      router.push('/floor-planner/' + data.id + '?initial=true');
    },
    onError: () => {
      toast.error('Failed to create floor. Please try again later.');
    },
  });

  const createFloor = async () => {
    if (createFloorMutation.isPending) return;
    await createFloorMutation.mutateAsync();
  };

  // create a new device

  const createDeviceMutation = useMutation({
    mutationFn: async (device: Partial<IDevice>) => {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device),
      });
      if (!response.ok) {
        throw new Error(`Failed to create device: ${response.statusText}`);
      }
      const json = await response.json();
      return json.data as IDevice;
    },
    onMutate: async () => {
      // Cancel outoging refetches
      await queryClient.cancelQueries({
        queryKey: ['devices', currentFloor?.id],
      });
    },
    onSuccess: newDevice => {
      toast.success('Device created successfully');

      // Update device list with new device
      queryClient.setQueryData<IDevice[]>(
        ['devices', currentFloor?.id],
        old => [...(old || []), newDevice]
      );

      queryClient.invalidateQueries({
        queryKey: ['devices', currentFloor?.id],
      });
    },
    onError: () => {
      toast.error('Failed to create device. Please try again later.');
    },
  });

  const createDevice = async (device: Partial<IDevice>): Promise<IDevice> => {
    return await createDeviceMutation.mutateAsync(device);
  };

  // Update device
  const updateDeviceMutation = useMutation({
    mutationFn: async ({
      deviceId,
      updates,
    }: {
      deviceId: string;
      updates: Partial<IDevice>;
    }) => {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error(`Failed to update device: ${response.statusText}`);
      }
      const json = await response.json();
      return json.data as IDevice;
    },

    onMutate: async () => {
      // Cancel outoging refetches
      await queryClient.cancelQueries({
        queryKey: ['devices', currentFloor?.id],
      });

      // Snapshot previous value
      const previousDevices = queryClient.getQueryData<IDevice[]>([
        'devices',
        currentFloor?.id,
      ]);

      return { previousDevices };
    },

    onError: (err, variables, context) => {
      // Revert on error
      queryClient.setQueryData(
        ['devices', currentFloor?.id],
        context?.previousDevices
      );
      toast.error('Failed to update device. Please try again later.');
    },

    onSettled: () => {
      // Refetch for consistency
      queryClient.invalidateQueries({
        queryKey: ['devices', currentFloor?.id],
      });
    },
  });

  const updateDevice = async (deviceId: string, updates: Partial<IDevice>) => {
    return await updateDeviceMutation.mutateAsync({
      deviceId,
      updates,
    });
  };

  // Debounced queue for device updates

  // Merge device updates
  const mergeDeviceUpdates = useCallback(
    (current: IDevice, updates: Partial<IDevice>): IDevice =>
      ({
        ...current,
        ...updates,
      } as IDevice),
    []
  );

  const applyOptimisticToCache = useCallback(
    (deviceId: string, updates: Partial<IDevice>) => {
      queryClient.setQueryData<IDevice[]>(['devices', currentFloor?.id], old =>
        (old ?? []).map(device =>
          device.id === deviceId ? mergeDeviceUpdates(device, updates) : device
        )
      );
    },
    [currentFloor?.id, mergeDeviceUpdates]
  );

  const queueDeviceUpdate = useCallback(
    (deviceId: string, updates: Partial<IDevice>) => {
      applyOptimisticToCache(deviceId, updates);

      const entry = pendingUpdatesRef.current.get(deviceId) ?? {
        timer: null,
        updates: {},
      };

      entry.updates = mergeDeviceUpdates(
        { id: deviceId } as IDevice,
        { ...(entry.updates || {}), ...updates } as Partial<IDevice>
      ) as Partial<IDevice>;

      if (entry.timer) {
        clearTimeout(entry.timer);
      }
      entry.timer = window.setTimeout(() => {
        updateDeviceMutation
          .mutateAsync({
            deviceId,
            updates: entry.updates,
          })
          .finally(() => {
            const e = pendingUpdatesRef.current.get(deviceId);
            if (e) {
              e.timer = null;
              e.updates = {};
            }
          });
      }, DEVICE_UPDATE_DEBOUNCE_MS);

      pendingUpdatesRef.current.set(deviceId, entry);
    },
    [applyOptimisticToCache, mergeDeviceUpdates, updateDeviceMutation]
  );

  const flushDeviceUpdates = useCallback(
    async (deviceId: string) => {
      const entry = pendingUpdatesRef.current.get(deviceId);
      if (!entry) return;

      if (entry.timer) {
        clearTimeout(entry.timer);
        entry.timer = null;
      }
      const payload = entry.updates;
      if (!payload || Object.keys(payload).length === 0) return;

      await updateDeviceMutation.mutateAsync({
        deviceId,
        updates: payload,
      });
      entry.updates = {};
    },
    [updateDeviceMutation]
  );

  // flush on unmount / page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      pendingUpdatesRef.current.forEach((_, deviceId) => {
        const entry = pendingUpdatesRef.current.get(deviceId);
        if (!entry) return;
        if (entry.timer) {
          clearTimeout(entry.timer);
          entry.timer = null;
        }
        // Fire-and-forget; cannot await during unload
        if (entry.updates && Object.keys(entry.updates).length > 0) {
          fetch(`/api/devices/${deviceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry.updates),
            keepalive: true, // best-effort
          });
          entry.updates = {};
        }
      });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const value: FloorsContextValue = {
    floors,
    currentFloorIndex,
    currentFloor,
    devices,
    floorsQueryStatus,
    devicesQueryStatus,
    isCreatingFloor: createFloorMutation.isPending,
    isCreatingDevice: createDeviceMutation.isPending,
    setCurrentFloorIndex: handleSetCurrentFloorIndex,
    refreshFloors: async () => {
      await refreshFloors();
    },
    createFloor,
    createDevice,
    updateDevice,
    queueDeviceUpdate,
    flushDeviceUpdates,
  };

  return (
    <FloorsContext.Provider value={value}>{children}</FloorsContext.Provider>
  );
}

export function useFloors() {
  const context = useContext(FloorsContext);
  if (context === undefined) {
    throw new Error('useFloors must be used within a FloorsProvider');
  }
  return context;
}
