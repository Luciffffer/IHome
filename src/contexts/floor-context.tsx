'use client';

import { IFloor } from '@/models/Floor';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface FloorContextValue {
  // floor data
  floors: IFloor[];
  currentFloorIndex: number;
  currentFloor: IFloor | null;

  // loading states
  isLoading: boolean;
  error: string | null;

  // actions
  setCurrentFloorIndex: (index: number) => void;
  refreshFloors: () => Promise<void>;
  createFloor: () => Promise<void>;
}

const FloorContext = createContext<FloorContextValue | undefined>(undefined);

interface FloorProviderProps {
  children: ReactNode;
}

export function FloorProvider({ children }: FloorProviderProps) {
  const [floors, setFloors] = useState<IFloor[]>([]);
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const createFloor = async () => {
    try {
      const tempName = `Floor ${floors.length + 1}`;
      const response = await fetch('api/floors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempName }),
      });

      if (!response.ok)
        throw new Error(`Failed to create floor: ${response.statusText}`);

      const data = await response.json();

      if (data.success) {
        // Send user to edit page for the new floor
        window.location.href = `/floor-planner/${data.data._id}`;
      }
    } catch (error) {
      console.error('Failed to create floor:', error);
      throw error;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchFloors();
  }, [fetchFloors]);

  const value: FloorContextValue = {
    floors,
    currentFloorIndex,
    currentFloor,
    isLoading,
    error,
    setCurrentFloorIndex,
    refreshFloors: fetchFloors,
    createFloor,
  };

  return (
    <FloorContext.Provider value={value}>{children}</FloorContext.Provider>
  );
}

export function useFloors() {
  const context = useContext(FloorContext);
  if (context === undefined) {
    throw new Error('useFloors must be used within a FloorProvider');
  }
  return context;
}
