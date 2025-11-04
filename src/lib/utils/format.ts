import { DAY_NAMES } from '@/types/schedule.types';

/**
 * Format time in 12-hour format
 */
export function formatTime12Hour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format day name
 */
export function formatDayName(day: number, short = false): string {
  return short ? DAY_NAMES.SHORT[day] : DAY_NAMES.LONG[day];
}

/**
 * Format device type for display
 */
export function formatDeviceType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}