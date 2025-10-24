'use client';

import { IFloor } from '@/models/Floor';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useCallback,
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
  isLoading: boolean;
  error: string | null;
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

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const currentFloor = floors[currentFloorIndex] || null;

  // fetch floors from API
  const fetchFloors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/floors');

      if (!response.ok) {
        throw new Error(`Failed to fetch floors: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setFloors(data.data);

        // Reset to first floor if current index is out of bounds
        if (currentFloorIndex >= data.data.length) {
          setCurrentFloorIndex(0);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch floors');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Failed to fetch floors:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentFloorIndex]);

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

  // Initial fetch
  useEffect(() => {
    fetchFloors();
  }, [fetchFloors]);

  const value: FloorsContextValue = {
    floors,
    currentFloorIndex,
    currentFloor,
    isLoading,
    error,
    isCreatingFloor: createFloorMutation.isPending,
    setCurrentFloorIndex,
    refreshFloors: fetchFloors,
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
