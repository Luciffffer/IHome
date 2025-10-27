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
import { useFloors } from '@/contexts/floors-context';
import { Spinner } from '../ui/spinner';
import Logo from '../ui/logo';
import Floor3DRenderer from './3d/floor-3d-renderer';

const FloorRenderer = memo(function FloorRenderer() {
  const { currentFloor, isLoading, error, createFloor, isCreatingFloor } =
    useFloors();
  const isEmpty = !isLoading && !error && !currentFloor;

  return (
    <main
      className="bg-muted h-full max-h-full bg-repeat bg-center flex items-center overflow-y-hidden relative"
      style={{
        backgroundImage: 'url(/images/workbench-bg-graphic.svg)',
      }}
    >
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
              Add Floor
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {currentFloor && <Floor3DRenderer />}

      <nav
        className="bg-white p-3 absolute bottom-6 left-1/2 -translate-x-1/2 rounded-md 
          drop-shadow-md translate-y-[200%]"
      >
        <ul>
          <li>
            <button className="bg-primary p-3 rounded-md text-white">
              <Plus />
            </button>
          </li>
        </ul>
      </nav>
    </main>
  );
});

export default FloorRenderer;
