'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useFloorUI } from '@/contexts/floor-ui-context';
import { fetchGlobalScenes } from '@/contexts/scenes/api';
import { sceneKeys } from '@/contexts/scenes/keys';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { toMinutes } from '../utils/schedule-conflicts';
import { Badge } from '@/components/ui/badge';

function GlobalScenesList() {
  const { openAddGlobalScene } = useFloorUI();

  const session = useSession();
  const role = session.data?.user?.role;

  const { data: globalScenes = [], status: globalScenesStatus } = useQuery({
    queryKey: sceneKeys.global(),
    queryFn: fetchGlobalScenes,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      {role === 'admin' && (
        <>
          <Button
            variant="outline"
            className="w-full"
            onClick={openAddGlobalScene}
          >
            <Plus />
            Add Global Scene
          </Button>
          <Separator
            orientation="horizontal"
            className="my-3 bg-border -mx-4 !w-auto"
          />
        </>
      )}

      {globalScenesStatus === 'pending' && (
        <div
          aria-label="Loading global scenes..."
          className="py-16 text-muted-foreground flex justify-center items-center"
        >
          <Spinner />
        </div>
      )}

      {globalScenesStatus === 'error' && (
        <p className="py-16 text-red-500 font-body-sm text-center">
          Failed to load global scenes. Please try again.
        </p>
      )}

      {globalScenesStatus === 'success' && globalScenes.length === 0 && (
        <p className="py-16 text-muted-foreground font-body-sm text-center">
          No global scenes found.
        </p>
      )}

      {globalScenesStatus === 'success' && globalScenes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {globalScenes.map(scene => {
            let active = false;
            let timeSlotsToday: { start: string; end: string } | null = null;

            const now = new Date();
            const currentDay = now.getDay();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            if (scene.schedule) {
              for (const slot of scene.schedule) {
                const { day, start, end } = slot;
                if (currentDay === day) {
                  timeSlotsToday = { start, end };
                  if (
                    currentTime < toMinutes(start) ||
                    currentTime > toMinutes(end)
                  ) {
                    active = true;
                  }
                  break;
                }
              }
            }

            return (
              <li key={scene!.name} className="block w-full">
                <button
                  type="button"
                  disabled={active}
                  className={`group text-left rounded-lg border border-border 
                  bg-card hover:bg-accent/30 transition-colors shadow-sm 
                  hover:shadow p-4 focus:outline-none focus:ring-2 focus:ring-ring
                  cursor-pointer w-full block
                  ${
                    active ? 'cursor-not-allowed bg-muted hover:bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="rounded-md border border-border/70 bg-muted/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={scene.imageUrl!}
                        alt={scene.name ?? 'Scene image'}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium truncate">
                          {scene.name ?? 'Unnamed device'}
                        </div>
                        {active && <Badge variant="default">Active</Badge>}
                      </div>
                      {scene.description ? (
                        <div className="text-muted-foreground text-sm mt-0.5 w-full">
                          {scene.description}
                        </div>
                      ) : null}

                      {timeSlotsToday && (
                        <div className="text-xs mt-2 text-foreground/80">
                          Scheduled today from {timeSlotsToday.start} to{' '}
                          {timeSlotsToday.end}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default GlobalScenesList;
