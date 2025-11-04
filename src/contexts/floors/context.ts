'use client';

import { createContext } from 'react';
import { IDevice } from '@/models/Device';
import { IFloor } from '@/models/Floor';
import { QueryStatus } from '@tanstack/react-query';

export interface FloorsContextValue {
  // floor data
  floors: IFloor[];
  currentFloorIndex: number;
  currentFloor: IFloor | null;

  // Device data
  allDevices: IDevice[];
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

export const FloorsContext = createContext<FloorsContextValue | undefined>(
  undefined
);