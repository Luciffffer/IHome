import { TimeSlot } from "@/models/Scene";

export interface ScheduleConflict {
  day: number;
  candidate: TimeSlot;
  other: {
    sceneId: string;
    sceneName?: string;
    slot: TimeSlot;
  };
}

export const DAY_NAMES = {
  SHORT: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const,
  LONG: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const,
} as const;