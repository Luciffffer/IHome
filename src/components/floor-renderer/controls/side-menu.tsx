'use client';

import {
  SidePopupMenu,
  SidePopupMenuContent,
  SidePopupMenuHeader,
} from '@/components/ui/side-popup-menu';
import { useFloorUI } from '../../../contexts/floor-ui-context';
import { useEffect, useRef, useState } from 'react';
import AddDeviceForm from './add-dervice-form';

function SideMenu() {
  const { sideMenuMode, closeSideMenu, pendingDevice } = useFloorUI();
  const [displayMode, setDisplayMode] = useState(sideMenuMode);
  const previousMode = useRef(sideMenuMode);

  useEffect(() => {
    if (sideMenuMode !== 'closed') {
      setDisplayMode(sideMenuMode);
    }
    previousMode.current = sideMenuMode;
  }, [sideMenuMode]);

  return (
    <SidePopupMenu
      isOpen={sideMenuMode !== 'closed'}
      side="right"
      onOpenChange={open => !open && closeSideMenu()}
    >
      <SidePopupMenuContent className="top-16 bottom-28">
        <SidePopupMenuHeader>
          <h2 className="font-heading-2xs">
            {displayMode === 'device-list' && 'Devices'}
            {displayMode === 'device-form' &&
              `Add ${
                pendingDevice != null
                  ? pendingDevice!.type!.charAt(0)?.toUpperCase() +
                    pendingDevice!.type!.slice(1)
                  : 'Device'
              }`}
            {displayMode === 'device-details' && 'Device Details'}
          </h2>
        </SidePopupMenuHeader>
        {displayMode === 'device-list' && (
          <>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
              <li>Item 4</li>
            </ul>
          </>
        )}
        {displayMode === 'device-form' && <AddDeviceForm />}
      </SidePopupMenuContent>
    </SidePopupMenu>
  );
}

export default SideMenu;
