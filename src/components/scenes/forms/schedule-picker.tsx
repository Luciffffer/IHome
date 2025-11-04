import { Controller, UseFormReturn } from 'react-hook-form';
import { Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sceneKeys } from '@/contexts/scenes/keys';
import { fetchGlobalScenes } from '@/contexts/scenes/api';
import { useEffect, useMemo } from 'react';
import { TimeSlot } from '@/models/Scene';
import { DAY_NAMES } from '@/types/schedule.types';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { findScheduleConflicts } from '@/lib/utils/schedule';

interface SchedulePickerProps {
  form: UseFormReturn<{
    schedule: TimeSlot[];
  }>;
}

const DAYS = DAY_NAMES.LONG.map((long, index) => ({
  index,
  label: DAY_NAMES.SHORT[index],
  long,
}));

function SchedulePicker({ form }: SchedulePickerProps) {
  const { data: globalScenes = [] } = useQuery({
    queryKey: sceneKeys.global(),
    queryFn: fetchGlobalScenes,
    staleTime: 0,
    refetchOnMount: true,
  });

  const schedule = form.watch('schedule');
  const conflicts = useMemo(() => {
    return findScheduleConflicts(schedule, globalScenes);
  }, [schedule, globalScenes]);

  useEffect(() => {
    if (conflicts.length > 0) {
      form.setError('schedule', {
        type: 'validate',
        message: `Conflicts with ${conflicts.length} existing global scene(s)`,
      });
    } else {
      form.clearErrors('schedule');
    }
  }, [conflicts, form]);

  return (
    <div className="flex flex-col gap-3">
      <Controller
        control={form.control}
        name="schedule"
        render={({ field, fieldState }) => {
          const value = field.value || [];

          const getDaySlot = (day: number) => value.find(v => v.day === day);
          const setDayActive = (day: number, active: boolean) => {
            if (active && !getDaySlot(day)) {
              field.onChange([...value, { day, start: '06:00', end: '10:00' }]);
            } else if (!active && getDaySlot(day)) {
              field.onChange(value.filter(v => v.day !== day));
            }
          };
          const setTime = (day: number, key: 'start' | 'end', time: string) => {
            field.onChange(
              value.map(v => (v.day === day ? { ...v, [key]: time } : v))
            );
          };

          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Active timeslots</FieldLabel>
              <div className="flex flex-col gap-2">
                {DAYS.map(d => {
                  const slot = getDaySlot(d.index);
                  const active = !!slot;
                  return (
                    <button
                      key={d.index}
                      className="flex items-start gap-3 rounded-md border border-border p-2 flex-col
                              cursor-pointer hover:bg-muted transition-colors"
                      onClick={e => {
                        if ((e.target as HTMLElement).tagName === 'INPUT') {
                          return;
                        }
                        setDayActive(d.index, !active);
                      }}
                      type="button"
                      aria-pressed={active}
                    >
                      <div
                        className={`flex gap-2 items-center justify-between w-full px-2 text-sm ${
                          active ? '' : 'text-muted-foreground'
                        }`}
                      >
                        <span>{d.long}</span>
                        <Check
                          className={`w-4 h-4 ${active ? '' : 'hidden'}`}
                        />
                      </div>

                      {active && (
                        <div className="flex items-center gap-2 flex-col">
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={slot?.start ?? '06:00'}
                              onChange={e =>
                                setTime(d.index, 'start', e.target.value)
                              }
                              disabled={!active}
                              className="w-full bg-background"
                            />
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                            <Input
                              type="time"
                              value={slot?.end ?? '10:00'}
                              onChange={e =>
                                setTime(d.index, 'end', e.target.value)
                              }
                              disabled={!active}
                              className="w-full bg-background"
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

              {conflicts.length > 0 && (
                <div className="text-xs text-destructive">
                  Conflicts:
                  <ul className="list-disc pl-5 mt-1">
                    {conflicts.slice(0, 5).map((c, i) => (
                      <li key={i}>
                        Day {c.day} {c.candidate.start}-{c.candidate.end}{' '}
                        overlaps with
                        {` "${c.other.sceneName ?? c.other.sceneId}" `}(
                        {c.other.slot.start}-{c.other.slot.end})
                      </li>
                    ))}
                    {conflicts.length > 5 && <li>…and more</li>}
                  </ul>
                </div>
              )}
            </Field>
          );
        }}
      />
    </div>
  );
}

export default SchedulePicker;
