'use client';

import { IFloor } from '@/models/Floor';
import { IRoom } from '@/models/Room';
import { createContext, useCallback, useContext, useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface FloorContextValue {
  floor: IFloor;
  rooms: IRoom[];
  updateFloorProperty: (key: keyof IFloor, value: unknown) => void;
  addRoom: (room: IRoom) => void;
  updateRoom: (roomId: string, updates: Partial<IRoom>) => void;
  deleteRoom: (roomId: string) => void;
  saveFloor: (override?: Partial<IFloor>) => Promise<void>;
  deleteFloor: () => Promise<void>;
  isDeletingFloor: boolean;
  isSavingFloor: boolean;
}

const floorContext = createContext<FloorContextValue | null>(null);

interface FloorProviderProps {
  initialFloor: IFloor;
  children: React.ReactNode;
}

export function FloorProvider({ initialFloor, children }: FloorProviderProps) {
  const [floor, setFloor] = useState<IFloor>(initialFloor);
  const [rooms, setRooms] = useState<IRoom[]>(initialFloor.rooms || []);
  const router = useRouter();

  const updateFloorProperty = useCallback(
    (key: keyof IFloor, value: unknown) => {
      setFloor(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const addRoom = useCallback((room: IRoom) => {
    setRooms(prev => [...prev, room]);
  }, []);

  const updateRoom = useCallback((roomId: string, updates: Partial<IRoom>) => {
    setRooms(prev =>
      prev.map(room => (room.id === roomId ? { ...room, ...updates } : room))
    );
  }, []);

  const deleteRoom = useCallback((roomId: string) => {
    setRooms(prev => prev.filter(room => room.id !== roomId));
  }, []);

  // SAVE FLOOR

  const saveFloorMutation = useMutation({
    mutationFn: async (floor: IFloor) => {
      const response = await fetch(`/api/floors/${floor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...floor,
          rooms,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save floor');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Floor saved successfully!');
    },
    onError: error => {
      toast.error('Failed to save floor. Please try again later.');
      console.error('Error saving floor:', error);
    },
  });

  const saveFloor = useCallback(
    async (override?: Partial<IFloor>) => {
      if (saveFloorMutation.isPending) return;
      await saveFloorMutation.mutateAsync({
        ...floor,
        rooms,
        ...override,
      });
    },
    [floor, rooms, saveFloorMutation]
  );

  // DELETE FLOOR

  const deleteFloorMutation = useMutation({
    mutationFn: async (floorId: string) => {
      const response = await fetch(`/api/floors/${floorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete floor');
      }
    },
    onSuccess: () => {
      toast.success('Floor deleted successfully! Redirecting...');
      router.push('/');
    },
    onError: error => {
      toast.error('Failed to delete floor. Please try again later.');
      console.error('Error deleting floor:', error);
    },
  });

  const deleteFloor = useCallback(async () => {
    if (deleteFloorMutation.isPending) return;
    await deleteFloorMutation.mutateAsync(floor.id);
  }, [floor.id, deleteFloorMutation]);

  return (
    <floorContext.Provider
      value={{
        floor,
        rooms,
        updateFloorProperty,
        addRoom,
        updateRoom,
        deleteRoom,
        saveFloor,
        deleteFloor,
        isDeletingFloor: deleteFloorMutation.isPending,
        isSavingFloor: saveFloorMutation.isPending,
      }}
    >
      {children}
    </floorContext.Provider>
  );
}

export function useFloor() {
  const context = useContext(floorContext);
  if (!context) {
    throw new Error('useFloorContext must be used within a FloorProvider');
  }
  return context;
}
