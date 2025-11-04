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
import SceneCard from '../../scenes/cards/scene-card';

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
            Save global scene
          </Button>
          <Separator
            orientation="horizontal"
            className="my-3 mt-5 bg-border -mx-4 !w-auto"
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
            return <SceneCard scene={scene} key={scene.id} />;
          })}
        </ul>
      )}
    </>
  );
}

export default GlobalScenesList;
