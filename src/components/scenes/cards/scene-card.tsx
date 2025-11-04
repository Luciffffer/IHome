import DeleteDialog from '@/components/common/delete-dialog';
import { queryClient } from '@/components/providers/react-query-provider';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { allDevicesKey, useFloors } from '@/contexts/floors';
import { activateScene, deleteScene } from '@/contexts/scenes/api';
import { sceneKeys } from '@/contexts/scenes/keys';
import { IDevice } from '@/models/Device';
import { IScene } from '@/models/Scene';
import { useMutation } from '@tanstack/react-query';
import { ChevronDown, Trash } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import SceneScheduleChips from './scene-schedule-chips';

interface SceneCardProps {
  scene: IScene;
}

function summarizeUpdates(updates: Record<string, string | number | boolean>) {
  const bits: string[] = [];
  if ('on' in updates) bits.push(updates.on ? 'On' : 'Off');
  if ('brightness' in updates) bits.push(`${updates.brightness}%`);
  if ('temperature' in updates) bits.push(`Temp ${updates.temperature}°`);
  if ('volume' in updates) bits.push(`Vol ${updates.volume}`);
  if ('playlist' in updates) bits.push(`${updates.playlist}`);
  if ('locked' in updates) bits.push(updates.locked ? 'Locked' : 'Unlocked');

  if (bits.length === 0) {
    const keys = Object.keys(updates || {});
    if (keys.length === 0) return 'No changes';
    const k = keys.slice(0, 2).map(k => `${k}=${String(updates[k])}`);
    return k.join(', ');
  }
  return bits.join(' • ');
}

function SceneCard({ scene }: SceneCardProps) {
  const { allDevices } = useFloors();
  const session = useSession();
  const user = session.data!.user!;
  const userId = user.id!;

  const actions = scene.actions ?? [];
  const preview = actions.slice(0, 3);
  const remaining = Math.max(0, actions.length - preview.length);

  const deleteMutation = useMutation({
    mutationFn: () => deleteScene(scene.id),
    onSuccess: () => {
      toast.success('Scene deleted successfully.');
      queryClient.invalidateQueries({ queryKey: sceneKeys.mine(userId) });
    },
    onError: () => {
      toast.error('Failed to delete scene. Please try again.');
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => activateScene(scene.id),
    onSuccess: () => {
      toast.success('Scene activated successfully. Updating devices...');
      queryClient.invalidateQueries({ queryKey: allDevicesKey });
    },
    onError: () => {
      toast.error('Failed to activate scene. Please try again.');
    },
  });

  return (
    <li className="block w-full">
      <div
        {...(scene.type === 'user' && {
          onClick: () =>
            !activateMutation.isPending && activateMutation.mutate(),
        })}
        role="button"
        className={`group text-left rounded-lg border border-border 
                bg-card transition-colors shadow-sm 
                p-4 focus:outline-none focus:ring-2 focus:ring-ring
                cursor-pointer w-full block
                ${
                  scene.type === 'user'
                    ? 'hover:shadow hover:bg-accent/30'
                    : '!cursor-default'
                }
                ${
                  activateMutation.isPending
                    ? 'animate-pulse cursor-not-allowed'
                    : ''
                }`}
      >
        <div className="flex items-start gap-3 w-full">
          <div className="rounded-md border border-border/70 bg-muted/40 w-10 h-10">
            {scene.imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={scene.imageUrl!}
                  alt={scene.name ?? 'Scene image'}
                  className="h-10 w-10 rounded-md object-cover"
                />
              </>
            ) : (
              <div className="h-10 w-10 flex items-center justify-center text-muted-foreground">
                {scene.name?.charAt(0).toUpperCase() +
                  scene.name?.charAt(1).toLowerCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium truncate">
                {scene.name ?? 'Unnamed scene'}
              </h3>
              {scene.type === 'user' || user.role === 'admin' ? (
                <div onClick={e => e.stopPropagation()}>
                  <DeleteDialog
                    onDelete={() => {
                      deleteMutation.mutate();
                    }}
                    description="Deleting the scene will permanently remove it from our servers. You won't be able to undo
                      this action."
                  >
                    <Button variant="ghost" size="icon-sm">
                      {deleteMutation.isPending ? <Spinner /> : <Trash />}
                    </Button>
                  </DeleteDialog>
                </div>
              ) : null}
            </div>

            {scene.description ? (
              <div className="text-muted-foreground text-sm mt-0.5 w-full">
                {scene.description}
              </div>
            ) : null}

            <SceneScheduleChips schedule={scene.schedule} />

            {/* Changes preview */}
            {actions.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Changes ({actions.length} device
                  {actions.length !== 1 ? 's' : ''})
                </div>

                <div className="flex flex-col gap-1">
                  {preview.map((action, index) => {
                    const d: IDevice | null =
                      allDevices.find(d => d.id === action.deviceId) || null;
                    const label = d?.name || 'device';
                    const sub = summarizeUpdates(action.state || {});
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="truncate">{label}</span>
                        <span className="truncate text-muted-foreground ml-2">
                          {sub}
                        </span>
                      </div>
                    );
                  })}
                  {remaining > 0 && (
                    <div className="text-xs text-muted-foreground">
                      +{remaining} more…
                    </div>
                  )}
                </div>

                {/* Details toggle for full list */}
                {actions.length > 3 && (
                  <details className="mt-1">
                    <summary className="text-xs text-foreground/80 inline-flex items-center gap-1 cursor-pointer">
                      Show all changes <ChevronDown className="w-3 h-3" />
                    </summary>
                    <div className="mt-2 flex flex-col gap-1">
                      {actions.slice(3).map((action, index2) => {
                        const d: IDevice | null =
                          allDevices.find(d => d.id === action.deviceId) ||
                          null;
                        const label = d?.name || 'device';
                        const sub = summarizeUpdates(action.state || {});
                        return (
                          <div
                            key={index2}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="truncate">{label}</span>
                            <span className="truncate text-muted-foreground ml-2">
                              {sub}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default SceneCard;
