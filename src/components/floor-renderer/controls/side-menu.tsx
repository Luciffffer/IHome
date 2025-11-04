'use client';

import {
  SidePopupMenu,
  SidePopupMenuContent,
  SidePopupMenuHeader,
} from '@/components/ui/side-popup-menu';
import { useFloorUI } from '../../../contexts/floor-ui-context';
import AddDeviceForm from '../../devices/forms/add-dervice-form';
import DeviceDetails from '../../devices/device-details';
import { useEffect, useState } from 'react';
import { useFloors } from '@/contexts/floors';
import EditDeviceForm from '../../devices/forms/edit-device-form';
import DeviceList from '../../devices/lists/device-list';
import ScenesList from '../../scenes/lists/scenes-list';
import AddGlobalSceneForm from '@/components/scenes/forms/add-global-scene-form';
import AddPersonalSceneForm from '@/components/scenes/forms/add-personal-scene-form';

function SideMenu() {
  const {
    sideMenuOpen,
    sideMenuMode,
    resetSideMenuState,
    closeSideMenu,
    pendingDevice,
    selectedDeviceId,
  } = useFloorUI();
  const [open, setOpen] = useState(sideMenuOpen);
  const { devices } = useFloors();

  const selectedDevice = devices?.find(d => d.id === selectedDeviceId);

  useEffect(() => {
    setOpen(sideMenuOpen);
  }, [sideMenuOpen]);

  return (
    <SidePopupMenu
      isOpen={open}
      side="right"
      onOpenChange={closeSideMenu}
      onAnimationComplete={() => {
        resetSideMenuState();
      }}
    >
      <SidePopupMenuContent className="top-16 bottom-28">
        <SidePopupMenuHeader>
          <h2 className="font-heading-2xs">
            {sideMenuMode === 'device-list' && 'Devices'}
            {sideMenuMode === 'device-form' &&
              `Add ${
                pendingDevice != null
                  ? pendingDevice!.type!.charAt(0)?.toUpperCase() +
                    pendingDevice!.type!.slice(1)
                  : 'Device'
              }`}
            {sideMenuMode === 'device-details' &&
              `${
                selectedDevice != null
                  ? selectedDevice.name.charAt(0).toUpperCase() +
                    selectedDevice.name.slice(1)
                  : 'Device'
              } Details`}
            {sideMenuMode === 'device-edit' &&
              `Edit ${
                selectedDevice != null
                  ? selectedDevice.name.charAt(0).toUpperCase() +
                    selectedDevice.name.slice(1)
                  : 'Device'
              }`}
            {sideMenuMode === 'scenes' && 'Scenes'}
            {sideMenuMode === 'add-global-scene' && 'Add Global Scene'}
            {sideMenuMode === 'add-personal-scene' && 'Add Personal Scene'}
          </h2>
        </SidePopupMenuHeader>
        {sideMenuMode === 'device-list' && <DeviceList />}
        {sideMenuMode === 'device-form' && <AddDeviceForm />}
        {sideMenuMode === 'device-details' && <DeviceDetails />}
        {sideMenuMode === 'device-edit' && <EditDeviceForm />}
        {sideMenuMode === 'scenes' && <ScenesList />}
        {sideMenuMode === 'add-global-scene' && <AddGlobalSceneForm />}
        {sideMenuMode === 'add-personal-scene' && <AddPersonalSceneForm />}
      </SidePopupMenuContent>
    </SidePopupMenu>
  );
}

export default SideMenu;
