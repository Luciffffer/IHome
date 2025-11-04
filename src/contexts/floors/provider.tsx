'use client';
import { queryClient } from '@/components/providers/react-query-provider';
import { IDevice } from '@/models/Device';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { floorsKey, allDevicesKey } from './keys';
import {
  fetchFloors,
  fetchDevices,
  createFloorApi,
  createDeviceApi,
  updateDeviceApi,
  deleteDeviceApi,
} from './api';
import { useDeviceUpdateQueue } from './update-queue';
import { FloorsContext, FloorsContextValue } from './context';

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
        queryKey: allDevicesKey,
      });
      const previousDevices =
        queryClient.getQueryData<IDevice[]>(allDevicesKey);
      return { previousDevices };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(allDevicesKey, ctx?.previousDevices);
      toast.error('Failed to update device. Please try again later.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: allDevicesKey,
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
  } = useDeviceUpdateQueue(updateDevice, 1000);

  // Fetch all devices
  const { data: rawDevices = [], status: devicesQueryStatus } = useQuery({
    queryKey: allDevicesKey,
    queryFn: () => fetchDevices(),
    enabled: !hasPendingUpdates(),
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const allDevices = useMemo(
    () => applyOverlay(rawDevices),
    [rawDevices, applyOverlay]
  );

  const devices = useMemo(() => {
    if (!currentFloor) return [];
    const roomIds = new Set(currentFloor.rooms.map(room => room.id));
    return allDevices.filter(device => roomIds.has(device.roomId));
  }, [allDevices, currentFloor]);

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
        queryKey: allDevicesKey,
      });
    },
    onSuccess: newDevice => {
      toast.success('Device created successfully');
      queryClient.setQueryData<IDevice[]>(allDevicesKey, old => [
        ...(old || []),
        newDevice,
      ]);
      queryClient.invalidateQueries({ queryKey: allDevicesKey });
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
      queryClient.setQueryData<IDevice[]>(allDevicesKey, old =>
        (old || []).filter(device => device.id !== deviceId)
      );
    },
  });

  const value: FloorsContextValue = {
    floors,
    currentFloorIndex,
    currentFloor,
    allDevices,
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
        queryKey: allDevicesKey,
      });
    },
    queueDeviceUpdate,
    flushDeviceUpdates,
  };

  return (
    <FloorsContext.Provider value={value}>{children}</FloorsContext.Provider>
  );
}
