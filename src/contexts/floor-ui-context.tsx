'use client';

import { DeviceType, IDevice } from '@/models/Device';
import { createContext, useContext, useState } from 'react';

type ViewMode = '2d' | '3d';
type SideMenuMode =
  | 'device-list'
  | 'device-details'
  | 'device-form'
  | 'device-edit'
  | 'scenes'
  | 'add-global-scene'
  | 'add-personal-scene';

interface FloorUIState {
  // View settings
  viewMode: ViewMode;

  // Side menu state
  sideMenuMode: SideMenuMode;
  sideMenuOpen: boolean;
  selectedDeviceId: string | null;
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
  resetSideMenuState: () => void;

  // Device placement actions
  startPlacingDevice: (type: DeviceType) => void;
  cancelPlacingDevice: () => void;
  togglePlacingDevice: (type: DeviceType) => void;

  // Device editing actions
  openDeviceEdit: (device: IDevice) => void;

  // Open scenes
  openScenes: () => void;

  // Open add global scene
  openAddGlobalScene: () => void;

  // Add personal scene
  openAddPersonalScene: () => void;

  // Add device menu actions
  openAddDeviceMenu: () => void;
  closeAddDeviceMenu: () => void;
}

const floorUIContext = createContext<FloorUIContextValue | null>(null);

export function FloorUIProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FloorUIState>({
    viewMode: '3d',
    sideMenuMode: 'device-list',
    sideMenuOpen: false,
    selectedDeviceId: null,
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
      selectedDeviceId: null,
      pendingDevice: null,
      sideMenuOpen: true,
    }));
  };

  const openDeviceDetail = (device: IDevice) => {
    setState(prev => ({
      ...prev,
      sideMenuMode: 'device-details',
      selectedDeviceId: device.id,
      pendingDevice: null,
      isAddDeviceMenuOpen: false,
      isPlacingDevice: false,
      placingDeviceType: null,
      sideMenuOpen: true,
    }));
  };

  const openDeviceForm = (pendingDevice: Partial<IDevice>) => {
    setState(prev => ({
      ...prev,
      sideMenuMode: 'device-form',
      selectedDeviceId: null,
      pendingDevice,
      sideMenuOpen: true,
    }));
  };

  const closeSideMenu = () => {
    setState(prev => ({
      ...prev,
      sideMenuOpen: false,
    }));
  };

  const resetSideMenuState = () => {
    setState(prev => ({
      ...prev,
      selectedDeviceId: null,
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
      sideMenuOpen: false,
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

  // Device editing actions
  const openDeviceEdit = (device: IDevice) => {
    setState(prev => ({
      ...prev,
      sideMenuMode: 'device-edit',
      selectedDeviceId: device.id,
      sideMenuOpen: true,
    }));
  };

  // Open scenes
  const openScenes = () => {
    setState(prev => ({
      ...prev,
      sideMenuMode: 'scenes',
      selectedDeviceId: null,
      pendingDevice: null,
      sideMenuOpen: true,
    }));
  };

  // Open add global scene
  const openAddGlobalScene = () => {
    setState(prev => ({
      ...prev,
      sideMenuMode: 'add-global-scene',
      selectedDeviceId: null,
      pendingDevice: null,
      sideMenuOpen: true,
    }));
  };

  // Open add personal scene
  const openAddPersonalScene = () => {
    setState(prev => ({
      ...prev,
      sideMenuMode: 'add-personal-scene',
      selectedDeviceId: null,
      pendingDevice: null,
      sideMenuOpen: true,
    }));
  };

  // Add device menu actions
  const openAddDeviceMenu = () => {
    setState(prev => ({
      ...prev,
      isAddDeviceMenuOpen: true,
      isPlacingDevice: false,
      placingDeviceType: null,
      pendingDevice: null,
      sideMenuOpen: false,
      viewMode: '2d',
    }));
  };

  const closeAddDeviceMenu = () => {
    setState(prev => ({
      ...prev,
      isAddDeviceMenuOpen: false,
      isPlacingDevice: false,
      placingDeviceType: null,
      sideMenuOpen: false,
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
        resetSideMenuState,
        startPlacingDevice,
        cancelPlacingDevice,
        togglePlacingDevice,
        openDeviceEdit,
        openScenes,
        openAddGlobalScene,
        openAddPersonalScene,
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
