/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function toMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get minutes since midnight for a given date
 */
export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Calculate days until target day from current day
 */
export function daysUntil(fromDay: number, toDay: number): number {
  return (toDay + 7 - fromDay) % 7;
}

/**
 * Check if current time falls within a schedule slot
 */
export function isInSchedule(
  schedule: Array<{ day: number; start: string; end: string }> | undefined,
  now: Date
): boolean {
  if (!schedule?.length) return false;

  const nowDay = now.getDay();
  const nowMinutes = minutesSinceMidnight(now);

  return schedule.some(slot => {
    if (slot.day !== nowDay) return false;
    const start = toMinutes(slot.start);
    const end = toMinutes(slot.end);
    return start <= nowMinutes && nowMinutes < end;
  });
}