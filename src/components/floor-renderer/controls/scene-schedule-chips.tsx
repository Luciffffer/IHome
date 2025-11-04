import { Badge } from '@/components/ui/badge';
import { toMinutes } from '../utils/schedule-conflicts';
import { useMemo } from 'react';

interface Schedule {
  day: number;
  start: string;
  end: string;
}

interface SceneScheduleChipsProps {
  schedule: Schedule[] | undefined;
}

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function minutesSinceMidnight(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

function isNowInSlot(slot: Schedule, now: Date) {
  if (now.getDay() !== slot.day) return false;
  const m = minutesSinceMidnight(now);
  const s = toMinutes(slot.start);
  const e = toMinutes(slot.end);
  return s <= m && m < e; // inclusive start, exclusive end
}

function daysUntil(fromDay: number, toDay: number) {
  return (toDay + 7 - fromDay) % 7;
}

function SceneScheduleChips({ schedule }: SceneScheduleChipsProps) {
  const sorted = useMemo(() => {
    if (!schedule?.length) return [];

    const now = new Date();
    const nowDay = now.getDay();
    const nowMinutes = minutesSinceMidnight(now);

    // Annotate each slot with it's distance from now
    const annotated = schedule.map(slot => {
      const isActive = isNowInSlot(slot, now);
      let dayDiff = daysUntil(nowDay, slot.day);
      const slotStartMinutes = toMinutes(slot.start);

      // If today and slot already passed, push to week
      if (dayDiff === 0 && slotStartMinutes <= nowMinutes) {
        dayDiff += 7;
      }

      const sortKey = dayDiff * 1440 + slotStartMinutes; // 1440 = minutes in a day

      return { ...slot, isActive, dayDiff, sortKey };
    });

    return annotated.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return a.sortKey - b.sortKey;
    });
  }, [schedule]);

  if (sorted.length === 0) return null;

  const formatTimeRange = (start: string, end: string) => `${start} - ${end}`;

  const getLabel = (slot: (typeof sorted)[0], isFirst: boolean) => {
    if (slot.isActive) {
      return `Active until ${slot.end}`;
    }
    if (isFirst) {
      if (slot.dayDiff === 0) return `Next • Today ${slot.start}`;
      if (slot.dayDiff === 1) return `Next • Tomorrow ${slot.start}`;
      return `Next • ${DAY_SHORT[slot.day]} ${slot.start}`;
    }
    return `${DAY_SHORT[slot.day]} ${formatTimeRange(slot.start, slot.end)}`;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map((slot, index) => {
        const isFirst = index === 0;
        const label = getLabel(slot, isFirst);
        const variant = slot.isActive
          ? 'default'
          : isFirst
          ? 'outline'
          : 'secondary';

        return (
          <Badge key={index} variant={variant}>
            {label}
          </Badge>
        );
      })}
    </div>
  );
}

export default SceneScheduleChips;
