import { IScene, TimeSlot } from "@/models/Scene";

export function toMinutes(hhmm: string): number {
  const [hh, mm] = hhmm.split(':').map(Number);
  return hh * 60 + mm;
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function findScheduleConflicts(
  candidate: TimeSlot[] | undefined,
  existing: IScene[] | undefined
) {
  const conflicts: Array<{
    day: number;
    candidate: TimeSlot;
    other: { sceneId: string; sceneName: string; slot: TimeSlot };
  }> = [];

  if (!candidate?.length || !existing?.length) return conflicts;

  for (const candSlot of candidate) {
    const candStart = toMinutes(candSlot.start);
    const candEnd = toMinutes(candSlot.end);
    for (const scene of existing) {
      if (!scene.schedule?.length) continue;
      for (const existSlot of scene.schedule) {
        if (existSlot.day !== candSlot.day) continue;
        const existStart = toMinutes(existSlot.start);
        const existEnd = toMinutes(existSlot.end);
        if (rangesOverlap(candStart, candEnd, existStart, existEnd)) {
          conflicts.push({
            day: candSlot.day,
            candidate: candSlot,
            other: {
              sceneId: scene.id,
              sceneName: scene.name,
              slot: existSlot,
            },
          });
        }
      }  
    }
  }

  return conflicts;
}

export function hasScheduleConflicts(
  candidate: TimeSlot[] | undefined,
  existing: IScene[] | undefined
): boolean {
  const conflicts = findScheduleConflicts(candidate, existing);
  return conflicts.length > 0;
}