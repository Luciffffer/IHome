'use client';

import { HouseWifi, Plus } from 'lucide-react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty';
import { Button } from '../ui/button';

function FloorRenderer({ selectedFloorId }: { selectedFloorId?: string }) {
  // simulate getting floor from api
  const isEmpty = !selectedFloorId;

  return (
    <main
      className="bg-muted h-full max-h-full bg-repeat bg-center flex items-center overflow-y-hidden relative"
      style={{
        backgroundImage: 'url(/images/workbench-bg-graphic.svg)',
      }}
    >
      {isEmpty && (
        <Empty className="bg-muted">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HouseWifi />
            </EmptyMedia>
            <EmptyTitle>No Floors Defined Yet!</EmptyTitle>
            <EmptyDescription>
              Get started by adding a new floor to your smart home system.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>Add Floor</Button>
          </EmptyContent>
        </Empty>
      )}

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
}

export default FloorRenderer;
