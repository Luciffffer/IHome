'use client';

import { DeviceType, IDevice } from '@/models/Device';
import { createContext, useContext, useState } from 'react';

type ViewMode = '2d' | '3d';
type SideMenuMode = 'closed' | 'device-list' | 'device-details' | 'device-form';

interface FloorUIState {
  // View settings
  viewMode: ViewMode;

  // Side menu state
  sideMenuMode: SideMenuMode;
  selectedDevice: IDevice | null;
  pendingDevice: Partial<IDevice> | null;

  // Device placement state
  isPlacingDevice: boolean;
  placingDeviceType: DeviceType | null;

  // Add device menu state
  isAddDeviceMenuOpen: boolean;
}

interface FloorUIContextValue extends FloorUIState {
  // View mode actions
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;

  // Side menu actions
  openDeviceList: () => void;
  openDeviceDetail: (device: IDevice) => void;
  openDeviceForm: (pendingDevice: Partial<IDevice>) => void;
  closeSideMenu: () => void;

  // Device placement actions
  startPlacingDevice: (type: DeviceType) => void;
  cancelPlacingDevice: () => void;
  togglePlacingDevice: (type: DeviceType) => void;

  // Add device menu actions
  openAddDeviceMenu: () => void;
  closeAddDeviceMenu: () => void;
}

const floorUIContext = createContext<FloorUIContextValue | null>(null);

export function FloorUIProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FloorUIState>({
    viewMode: '3d',
    sideMenuMode: 'closed',
    selectedDevice: null,
    pendingDevice: null,
    isPlacingDevice: false,
    placingDeviceType: null,
    isAddDeviceMenuOpen: false,
  });

  // View mode actions
  const setViewMode = (mode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  };

  const toggleViewMode = () => {
    setState(prev => ({
      ...prev,
      viewMode: prev.viewMode === '2d' ? '3d' : '2d',
    }));
  };

  // Side menu actions
  const openDeviceList = () => {
    setState(prev => ({
      ...prev,
      sideMenuMode: 'device-list',
      selectedDevice: null,
      pendingDevice: null,
    }));
  };

  const openDeviceDetail = (device: IDevice) => {
    setState(prev => ({
      ...prev,
      sideMenuMode: 'device-details',
      selectedDevice: device,
      pendingDevice: null,
    }));
  };

  const openDeviceForm = (pendingDevice: Partial<IDevice>) => {
    setState(prev => ({
      ...prev,
      sideMenuMode: 'device-form',
      selectedDevice: null,
      pendingDevice,
    }));
  };

  const closeSideMenu = () => {
    setState(prev => ({
      ...prev,
      sideMenuMode: 'closed',
      selectedDevice: null,
      pendingDevice: null,
    }));
  };

  // Device placement actions
  const startPlacingDevice = (type: DeviceType) => {
    setState(prev => ({
      ...prev,
      viewMode: '2d',
      isPlacingDevice: true,
      placingDeviceType: type,
      sideMenuMode: 'closed',
    }));
  };

  const cancelPlacingDevice = () => {
    setState(prev => ({
      ...prev,
      isPlacingDevice: false,
      placingDeviceType: null,
    }));
  };

  const togglePlacingDevice = (type: DeviceType) => {
    setState(prev => {
      if (prev.isPlacingDevice && prev.placingDeviceType === type) {
        return {
          ...prev,
          isPlacingDevice: false,
          placingDeviceType: null,
        };
      }
      return {
        ...prev,
        isPlacingDevice: true,
        placingDeviceType: type,
      };
    });
  };

  // Add device menu actions
  const openAddDeviceMenu = () => {
    setState(prev => ({
      ...prev,
      isAddDeviceMenuOpen: true,
      isPlacingDevice: false,
      placingDeviceType: null,
      pendingDevice: null,
      sideMenuMode: 'closed',
      viewMode: '2d',
    }));
  };

  const closeAddDeviceMenu = () => {
    setState(prev => ({
      ...prev,
      isAddDeviceMenuOpen: false,
      isPlacingDevice: false,
      placingDeviceType: null,
      sideMenuMode: 'closed',
      viewMode: '3d',
      pendingDevice: null,
    }));
  };

  return (
    <floorUIContext.Provider
      value={{
        ...state,
        setViewMode,
        toggleViewMode,
        openDeviceList,
        openDeviceDetail,
        openDeviceForm,
        closeSideMenu,
        startPlacingDevice,
        cancelPlacingDevice,
        togglePlacingDevice,
        openAddDeviceMenu,
        closeAddDeviceMenu,
      }}
    >
      {children}
    </floorUIContext.Provider>
  );
}

export function useFloorUI() {
  const context = useContext(floorUIContext);
  if (!context) {
    throw new Error('useFloorUI must be used within a FloorUIProvider');
  }
  return context;
}
