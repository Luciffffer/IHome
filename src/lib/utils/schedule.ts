import { IScene, TimeSlot } from '@/models/Scene';
import { ScheduleConflict } from '@/types/schedule.types';
import { toMinutes } from './time';

export function findScheduleConflicts(
  candidateSchedule: TimeSlot[],
  existingScenes: IScene[]
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (const candidate of candidateSchedule) {
    for (const scene of existingScenes) {
      if (!scene.schedule) continue;

      for (const slot of scene.schedule) {
        if (slot.day !== candidate.day) continue;

        const candidateStart = toMinutes(candidate.start);
        const candidateEnd = toMinutes(candidate.end);
        const slotStart = toMinutes(slot.start);
        const slotEnd = toMinutes(slot.end);

        // Check for overlap
        if (candidateStart < slotEnd && candidateEnd > slotStart) {
          conflicts.push({
            day: candidate.day,
            candidate,
            other: {
              sceneId: scene.id,
              sceneName: scene.name,
              slot,
            },
          });
        }
      }
    }
  }

  return conflicts;
}