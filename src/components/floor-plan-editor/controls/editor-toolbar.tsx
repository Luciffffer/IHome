import { MousePointer2, Pencil, Save } from 'lucide-react';
import { Button } from '../../ui/button';
import { InteractionMode } from '../floor-plan-editor';
import SettingsPanel from './settings-panel';

interface EditorToolbarProps {
  interactionMode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
  onSave: () => void;
}

export function EditorToolbar({
  interactionMode,
  onModeChange,
  onSave,
}: EditorToolbarProps) {
  return (
    <nav
      aria-label="Control selector"
      className="absolute bottom-6 bg-white left-1/2 -translate-x-1/2 shadow-2xl rounded-xl"
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
        <hr className="h-full w-px bg-gray-300 shrink-0" />
        <li>
          <SettingsPanel />
        </li>
        <hr className="h-full w-px bg-gray-300 shrink-0" />
        <li>
          <Button
            size="lg"
            className="cursor-pointer"
            variant="ghost"
            onClick={onSave}
          >
            <Save />
            Save
          </Button>
        </li>
      </ul>
    </nav>
  );
}
