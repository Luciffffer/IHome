import { MousePointer2, Pencil, Save } from 'lucide-react';
import { Button } from '../../../ui/button';
import { InteractionMode } from '../floor-plan-editor';
import SettingsPanel from './settings-panel';
import { useFloor } from '@/contexts/floor-context';
import { Spinner } from '@/components/ui/spinner';

interface EditorToolbarProps {
  interactionMode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
}

export function EditorToolbar({
  interactionMode,
  onModeChange,
}: EditorToolbarProps) {
  const { isSavingFloor, saveFloor } = useFloor();

  return (
    <nav
      aria-label="Control selector"
      className="absolute bottom-6 bg-background left-1/2 -translate-x-1/2 shadow-2xl rounded-xl"
    >
      <ul className="h-14 flex items-center justify-center gap-3 px-2 *:[li]:py-2">
        <li>
          <Button
            aria-label="Selection mode"
            size="icon-lg"
            variant={interactionMode === 'select' ? 'default' : 'ghost'}
            className="cursor-pointer *:[svg]:!w-5 *:[svg]:!h-5"
            onClick={() => onModeChange('select')}
          >
            <MousePointer2 />
          </Button>
        </li>
        <li>
          <Button
            aria-label="Drawing mode"
            size="icon-lg"
            variant={interactionMode === 'drawing' ? 'default' : 'ghost'}
            className="cursor-pointer *:[svg]:!w-5 *:[svg]:!h-5"
            onClick={() => onModeChange('drawing')}
          >
            <Pencil />
          </Button>
        </li>
        <hr className="h-full w-px bg-muted shrink-0" />
        <li>
          <SettingsPanel />
        </li>
        <hr className="h-full w-px bg-muted shrink-0" />
        <li>
          <Button
            size="lg"
            className="cursor-pointer"
            variant="ghost"
            onClick={() => saveFloor()}
          >
            {isSavingFloor ? <Spinner /> : <Save />}
            Save
          </Button>
        </li>
      </ul>
    </nav>
  );
}
