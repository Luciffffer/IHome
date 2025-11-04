import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useFloorUI } from '@/contexts/floor-ui-context';
import { fetchMyScenes } from '@/contexts/scenes/api';
import { sceneKeys } from '@/contexts/scenes/keys';
import { Separator } from '@radix-ui/react-separator';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import SceneCard from '../../scenes/cards/scene-card';

function MyScenesList() {
  const { openAddPersonalScene } = useFloorUI();
  const session = useSession();
  const userId = session.data!.user!.id!;

  const { data: myScenes = [], status: myScenesStatus } = useQuery({
    queryKey: sceneKeys.mine(userId),
    queryFn: fetchMyScenes,
    enabled: !!userId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      <Button
        variant="outline"
        className="w-full"
        onClick={openAddPersonalScene}
      >
        <Plus />
        Save personal scene
      </Button>
      <Separator
        orientation="horizontal"
        className="my-3 h-px mt-5 bg-border -mx-4 !w-auto"
      />

      {myScenesStatus === 'pending' && (
        <div
          aria-label="Loading global scenes..."
          className="py-16 text-muted-foreground flex justify-center items-center"
        >
          <Spinner />
        </div>
      )}

      {myScenesStatus === 'error' && (
        <p className="py-16 text-red-500 font-body-sm text-center">
          Failed to load personal scenes. Please try again.
        </p>
      )}

      {myScenesStatus === 'success' && myScenes.length === 0 && (
        <p className="py-16 text-muted-foreground font-body-sm text-center">
          No personal scenes found.
        </p>
      )}

      {myScenesStatus === 'success' && myScenes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {myScenes.map(scene => (
            <SceneCard key={scene.id} scene={scene} />
          ))}
        </ul>
      )}
    </>
  );
}

export default MyScenesList;
