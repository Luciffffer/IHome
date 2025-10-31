'use client';

import { Plus } from 'lucide-react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty';
import { Button } from '../ui/button';
import { memo } from 'react';
import { useFloors } from '@/contexts/floors';
import { Spinner } from '../ui/spinner';
import Logo from '../ui/logo';
import Floor3DRenderer from './3d/floor-3d-renderer';
import Toolbar from './controls/toolbar';
import Link from 'next/link';
import AddDeviceList from './controls/add-device-list';
import { Toaster } from '../ui/sonner';
import { useFloorUI } from '../../contexts/floor-ui-context';
import SideMenu from './controls/side-menu';

const FloorRenderer = memo(function FloorRenderer() {
  const { currentFloor, floorsQueryStatus, createFloor, isCreatingFloor } =
    useFloors();
  const { isAddDeviceMenuOpen } = useFloorUI();

  const isLoading = floorsQueryStatus === 'pending';
  const isEmpty = floorsQueryStatus === 'success' && !currentFloor;
  const noRooms =
    floorsQueryStatus === 'success' &&
    currentFloor != null &&
    (!currentFloor.rooms || currentFloor.rooms.length === 0);
  const hasRooms =
    floorsQueryStatus === 'success' &&
    currentFloor !== null &&
    currentFloor.rooms &&
    currentFloor.rooms.length > 0;

  return (
    <main
      className="bg-muted h-full max-h-full bg-repeat bg-center flex items-center 
        overflow-y-hidden relative flex-col"
      style={{
        backgroundImage: 'url(/images/workbench-bg-graphic.svg)',
      }}
    >
      <Toaster />
      {isLoading && (
        <div className="bg-muted h-72 w-full flex items-center justify-center">
          <Spinner className="size-12 text-muted-foreground" />
        </div>
      )}

      {isEmpty && (
        <Empty className="bg-muted h-72">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Logo className="!w-9" />
            </EmptyMedia>
            <EmptyTitle>No Floors Defined Yet!</EmptyTitle>
            <EmptyDescription>
              Get started by adding a new floor to your smart home system.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button className="cursor-pointer" onClick={createFloor}>
              {isCreatingFloor ? <Spinner /> : <Plus />}
              Add floor
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {noRooms && (
        <Empty className="bg-muted h-72">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Logo className="!w-9" />
            </EmptyMedia>
            <EmptyTitle>No Rooms on This Floor Yet!</EmptyTitle>
            <EmptyDescription>Add some rooms to get started.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button className="cursor-pointer" asChild>
              <Link href={`/floor-planner/${currentFloor.id}`}>Edit floor</Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {hasRooms && <Floor3DRenderer />}

      <Toolbar hidden={isEmpty || noRooms || isAddDeviceMenuOpen} />

      {isAddDeviceMenuOpen && <AddDeviceList />}

      <SideMenu />
    </main>
  );
});

export default FloorRenderer;
