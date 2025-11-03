import { 
  Lock, 
  Unlock, 
  LightbulbOff, 
  VolumeX,
  Power,
  LucideIcon 
} from 'lucide-react';

export interface IFastAction {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color?: string;
}

export const FAST_ACTIONS: IFastAction[] = [
  {
    id: 'lock-all-doors',
    name: 'Lock All Doors',
    description: 'Locks all doors in the building instantly',
    icon: Lock,
    color: 'text-blue-500',
  },
  {
    id: 'unlock-all-doors',
    name: 'Unlock All Doors',
    description: 'Unlocks all doors in the building',
    icon: Unlock,
    color: 'text-green-500',
  },
  {
    id: 'lights-off',
    name: 'Turn Off All Lights',
    description: 'Turns off all lights in the building',
    icon: LightbulbOff,
    color: 'text-muted-foreground',
  },
  {
    id: 'mute-all-audio',
    name: 'Mute All Audio',
    description: 'Mutes all audio devices',
    icon: VolumeX,
    color: 'text-muted-foreground',
  },
  {
    id: 'emergency-shutdown',
    name: 'Emergency Shutdown',
    description: 'Turns off all devices immediately',
    icon: Power,
    color: 'text-orange-500',
  },
];