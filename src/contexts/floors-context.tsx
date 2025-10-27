'use client';

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

  // loading states
  floorsQueryStatus: QueryStatus;
  isCreatingFloor: boolean;

  // actions
  setCurrentFloorIndex: (index: number) => void;
  refreshFloors: () => Promise<void>;
  createFloor: () => Promise<void>;
}

const FloorsContext = createContext<FloorsContextValue | undefined>(undefined);

interface FloorsProviderProps {
  children: ReactNode;
}

export function FloorsProvider({ children }: FloorsProviderProps) {
  const [floors, setFloors] = useState<IFloor[]>([]);
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);

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

    console.log('Floors data changed:', hasChange);

    if (hasChange) {
      setFloors(floorsQueryData);

      // Reset to first floor if current index is out of bounds
      if (currentFloorIndex >= floorsQueryData.length) {
        setCurrentFloorIndex(0);
      }
    }
  }, [floorsQueryData, currentFloorIndex, floors]);

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

  const value: FloorsContextValue = {
    floors,
    currentFloorIndex,
    currentFloor,
    floorsQueryStatus,
    isCreatingFloor: createFloorMutation.isPending,
    setCurrentFloorIndex,
    refreshFloors: async () => {
      await refreshFloors();
    },
    createFloor,
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
