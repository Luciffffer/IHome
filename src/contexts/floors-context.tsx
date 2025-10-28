'use client';

import { IDevice } from '@/models/Device';
import { IFloor } from '@/models/Floor';
import { QueryStatus, useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
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
}

const FloorsContext = createContext<FloorsContextValue | undefined>(undefined);

interface FloorsProviderProps {
  children: ReactNode;
}

export function FloorsProvider({ children }: FloorsProviderProps) {
  const [floors, setFloors] = useState<IFloor[]>([]);
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const [devices, setDevices] = useState<IDevice[]>([]);

  const router = useRouter();
  const currentFloor = floors[currentFloorIndex] || null;

  // fetch floors from API
  const {
    data: floorsQueryData,
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

  useEffect(() => {
    if (!floorsQueryData) return;

    const hasChange =
      JSON.stringify(floorsQueryData) !== JSON.stringify(floors);

    if (hasChange) {
      setFloors(floorsQueryData);
    }
  }, [floorsQueryData, currentFloorIndex, floors]);

  useEffect(() => {
    if (floors.length > 0 && currentFloorIndex >= floors.length) {
      setCurrentFloorIndex(0);
    }
  }, [floors, currentFloorIndex]);

  // fetch devices for the current floor

  const { data: devicesQueryData, status: devicesQueryStatus } = useQuery({
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
    enabled: !!currentFloor,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  useEffect(() => {
    if (!devicesQueryData) return;

    const hasChange =
      JSON.stringify(devicesQueryData) !== JSON.stringify(devices);

    if (hasChange) {
      setDevices(devicesQueryData);
    }
  }, [devicesQueryData, devices]);

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

      return response.json();
    },
    onSuccess: data => {
      router.push('/floor-planner/' + data.data.id + '?initial=true');
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
      return response.json();
    },
    onSuccess: () => {
      toast.success('Device created successfully');
      // setDevices(prevDevices => [...prevDevices, data]);
    },
    onError: () => {
      toast.error('Failed to create device. Please try again later.');
    },
  });

  const createDevice = (device: Partial<IDevice>) => {
    createDeviceMutation.mutate(device);
  };

  const value: FloorsContextValue = {
    floors,
    currentFloorIndex,
    currentFloor,
    devices,
    floorsQueryStatus,
    devicesQueryStatus,
    isCreatingFloor: createFloorMutation.isPending,
    isCreatingDevice: createDeviceMutation.isPending,
    setCurrentFloorIndex,
    refreshFloors: async () => {
      await refreshFloors();
    },
    createFloor,
    createDevice,
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
