import { FAST_ACTIONS } from '@/config/fast-actions';
import { useFloors } from '@/contexts/floors';
import { activateFastScene } from '@/contexts/scenes/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

function FastActionsList() {
  const { invalidateDevices } = useFloors();

  const mutation = useMutation({
    mutationFn: activateFastScene,
    onSuccess: () => {
      toast.success('Scene activated successfully. Updating devices...');
      invalidateDevices();
    },
    onError: () => {
      toast.error('Failed to activate scene. Please try again.');
    },
  });

  return (
    <ul className="flex flex-col gap-2">
      {FAST_ACTIONS.map(action => (
        <li key={action.id} className="block w-full">
          <button
            type="button"
            onClick={() => mutation.mutate(action.id)}
            disabled={mutation.isPending}
            className="group text-left rounded-lg border border-border 
                  bg-card hover:bg-accent/30 transition-colors shadow-sm 
                  hover:shadow p-4 focus:outline-none focus:ring-2 focus:ring-ring
                  cursor-pointer w-full block"
          >
            <div className="flex items-start gap-3 w-full">
              <div className="rounded-md border border-border/70 bg-muted/40 p-2">
                <action.icon
                  className={`w-6 h-6 ${action.color ?? 'text-foreground'}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium truncate">
                    {action.name ?? 'Unnamed device'}
                  </div>
                </div>
                {action.description ? (
                  <div className="text-muted-foreground text-sm mt-0.5 w-full">
                    {action.description}
                  </div>
                ) : null}
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default FastActionsList;
