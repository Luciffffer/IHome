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
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import { floorsKey, devicesKey } from './keys';
import {
  fetchFloors,
  fetchDevices,
  createFloorApi,
  createDeviceApi,
  updateDeviceApi,
  deleteDeviceApi,
} from './api';
import { useDeviceUpdateQueue } from './update-queue';

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
  isUpdatingDevice: boolean;
  isDeletingDevice: boolean;

  // actions
  setCurrentFloorIndex: (index: number) => void;
  refreshFloors: () => Promise<void>;
  createFloor: () => Promise<void>;
  createDevice: (device: Partial<IDevice>) => Promise<IDevice>;
  invalidateDevices: () => Promise<void>;
  updateDevice: (
    deviceId: string,
    updates: Partial<IDevice>
  ) => Promise<IDevice>;
  deleteDevice(deviceId: string): Promise<void>;

  // Debounced writes
  queueDeviceUpdate: (deviceId: string, updates: Partial<IDevice>) => void;
  flushDeviceUpdates: (deviceId: string) => Promise<void>;
}

const FloorsContext = createContext<FloorsContextValue | undefined>(undefined);

export function FloorsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

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

  // Fetch floors
  const {
    data: floors = [],
    status: floorsQueryStatus,
    refetch: refreshFloors,
  } = useQuery({
    queryKey: floorsKey,
    queryFn: fetchFloors,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const currentFloor = floors[currentFloorIndex] ?? null;

  useEffect(() => {
    if (floors.length > 0 && currentFloorIndex >= floors.length) {
      setCurrentFloorIndex(0);
    }
  }, [floors, currentFloorIndex]);

  // Update device
  const updateDeviceMutation = useMutation({
    mutationFn: ({
      deviceId,
      updates,
    }: {
      deviceId: string;
      updates: Partial<IDevice>;
    }) => updateDeviceApi(deviceId, updates),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: devicesKey(currentFloor?.id),
      });
      const previousDevices = queryClient.getQueryData<IDevice[]>(
        devicesKey(currentFloor?.id)
      );
      return { previousDevices };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(
        devicesKey(currentFloor?.id),
        ctx?.previousDevices
      );
      toast.error('Failed to update device. Please try again later.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: devicesKey(currentFloor?.id),
      });
    },
  });

  const updateDevice = useCallback(
    async (deviceId: string, updates: Partial<IDevice>) =>
      await updateDeviceMutation.mutateAsync({ deviceId, updates }),
    [updateDeviceMutation]
  );

  // Device update queue (debounced updates)
  const {
    queueDeviceUpdate,
    flushDeviceUpdates,
    hasPendingUpdates,
    applyOverlay,
  } = useDeviceUpdateQueue(currentFloor?.id, updateDevice, 1000);

  // Fetch devices for current floor
  const { data: rawDevices = [], status: devicesQueryStatus } = useQuery({
    queryKey: devicesKey(currentFloor?.id),
    queryFn: () =>
      currentFloor ? fetchDevices(currentFloor.id) : Promise.resolve([]),
    enabled: !!currentFloor?.id && !hasPendingUpdates(),
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const devices = useMemo(
    () => applyOverlay(rawDevices),
    [rawDevices, applyOverlay]
  );

  // Create floor
  const createFloorMutation = useMutation({
    mutationFn: async () => {
      const tempName = `Floor ${floors.length + 1}`;
      return await createFloorApi(tempName);
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: floorsKey });
      router.push('/floor-planner/' + data.id + '?initial=true');
    },
    onError: () =>
      toast.error('Failed to create floor. Please try again later.'),
  });

  // Create device
  const createDeviceMutation = useMutation({
    mutationFn: createDeviceApi,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: devicesKey(currentFloor?.id),
      });
    },
    onSuccess: newDevice => {
      toast.success('Device created successfully');
      queryClient.setQueryData<IDevice[]>(devicesKey(currentFloor?.id), old => [
        ...(old || []),
        newDevice,
      ]);
      queryClient.invalidateQueries({ queryKey: devicesKey(currentFloor?.id) });
    },
    onError: () =>
      toast.error('Failed to create device. Please try again later.'),
  });

  // Delete device
  const deleteDeviceMutation = useMutation({
    mutationFn: deleteDeviceApi,
    onError: () => {
      toast.error('Failed to delete device. Please try again later.');
    },
    onSuccess: (_data, deviceId) => {
      toast.success('Device deleted successfully');
      queryClient.setQueryData<IDevice[]>(devicesKey(currentFloor?.id), old =>
        (old || []).filter(device => device.id !== deviceId)
      );
    },
  });

  const value: FloorsContextValue = {
    floors,
    currentFloorIndex,
    currentFloor,
    devices,
    floorsQueryStatus,
    devicesQueryStatus,
    isCreatingFloor: createFloorMutation.isPending,
    isCreatingDevice: createDeviceMutation.isPending,
    isUpdatingDevice: updateDeviceMutation.isPending,
    isDeletingDevice: deleteDeviceMutation.isPending,
    setCurrentFloorIndex: handleSetCurrentFloorIndex,
    refreshFloors: async () => {
      await refreshFloors();
    },
    createFloor: async () => {
      if (!createFloorMutation.isPending)
        await createFloorMutation.mutateAsync();
    },
    createDevice: async (device: Partial<IDevice>) => {
      return await createDeviceMutation.mutateAsync(device);
    },
    deleteDevice: async (deviceId: string) => {
      await deleteDeviceMutation.mutateAsync(deviceId);
    },
    updateDevice,
    invalidateDevices: async () => {
      await queryClient.invalidateQueries({
        queryKey: devicesKey(currentFloor?.id),
      });
    },
    queueDeviceUpdate,
    flushDeviceUpdates,
  };

  return (
    <FloorsContext.Provider value={value}>{children}</FloorsContext.Provider>
  );
}

export function useFloors() {
  const ctx = useContext(FloorsContext);
  if (!ctx) throw new Error('useFloors must be used within a FloorsProvider');
  return ctx;
}
