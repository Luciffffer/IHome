import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@radix-ui/react-separator';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from '@/components/ui/button';
import { useFloorUI } from '@/contexts/floor-ui-context';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createGlobalScene } from '@/contexts/scenes/api';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import DevicePicker from './device-picker';
import SchedulePicker from './schedule-picker';
import { SceneDetailsFields } from './scene-details-fields';

const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;

const slotSchema = z
  .object({
    day: z.number().min(0).max(6),
    start: z.string().regex(timeRe, 'Invalid time format (HH:MM)'),
    end: z.string().regex(timeRe, 'Invalid time format (HH:MM)'),
  })
  .refine(v => v.start < v.end, {
    message: 'Start time must be before end time',
    path: ['end'],
  });

const globalSceneSchema = z.object({
  devices: z
    .array(z.string().min(1, 'Invalid Device ID'))
    .min(1, 'At least one device is required'),
  schedule: z
    .array(slotSchema)
    .min(1, 'At least one time slot is required')
    .optional(),
  name: z.string().min(1, 'Name is required').max(32, 'Name is too long'),
  description: z.string().max(256, 'Description is too long').optional(),
  imageUrl: z
    .string()
    .regex(
      /^$|^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/,
      'Invalid image URL'
    )
    .optional(),
});

type GlobalSceneFormValues = z.infer<typeof globalSceneSchema>;

function AddGlobalSceneForm() {
  const { openScenes } = useFloorUI();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const form = useForm<GlobalSceneFormValues>({
    resolver: zodResolver(globalSceneSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      devices: [],
      schedule: [],
    },
    mode: 'onChange',
  });

  const mutation = useMutation({
    mutationFn: createGlobalScene,
    onSuccess: () => {
      toast.success('Global scene created successfully.');
      openScenes();
    },
    onError: () => {
      toast.error('Failed to create global scene. Please try again.');
    },
  });

  const handleFormSubmit = (data: GlobalSceneFormValues) => {
    mutation.mutate(data);
  };

  const next = async () => {
    const fieldsPerStep: Record<number, Array<keyof GlobalSceneFormValues>> = {
      0: ['devices'],
      1: ['schedule'],
      2: ['name', 'imageUrl', 'description'],
    };
    const ok = await form.trigger(fieldsPerStep[step], { shouldFocus: true });
    if (ok) setStep(prev => (prev === 2 ? 2 : ((prev + 1) as 1 | 2)));
  };

  const back = () => setStep(prev => (prev === 0 ? 0 : ((prev - 1) as 0 | 1)));

  return (
    <div className="flex flex-col">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-xs -mt-2 mb-3">
        <span
          className={step === 0 ? 'font-semibold' : 'text-muted-foreground'}
        >
          1. Devices
        </span>
        <span className="text-muted-foreground">/</span>
        <span
          className={step === 1 ? 'font-semibold' : 'text-muted-foreground'}
        >
          2. Schedule
        </span>
        <span className="text-muted-foreground">/</span>
        <span
          className={step === 2 ? 'font-semibold' : 'text-muted-foreground'}
        >
          3. Details
        </span>
      </div>
      <Separator
        orientation="horizontal"
        className="mb-9 bg-border -mx-4 !w-auto h-px"
      />
      <form
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(handleFormSubmit)}
      >
        {step === 0 && (
          <>
            <p className="font-body-sm text-muted-foreground mb-3">
              Select the devices you want to include in this global scene. The{' '}
              <strong>current states</strong> of these devices will be saved and
              applied when the scene is activated.
            </p>

            {/* Need to use any because use form has a complex structure */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <DevicePicker form={form as any} />
          </>
        )}

        {step === 1 && (
          <>
            {/* Need to use any because use form has a complex structure */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <SchedulePicker form={form as any} />
          </>
        )}

        {step === 2 && (
          <>
            {/* Need to use any because use form has a complex structure */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <SceneDetailsFields form={form as any} />
          </>
        )}
        <Separator
          orientation="horizontal"
          className="my-3 mt-9 bg-border -mx-4 !w-auto h-px"
        />
        <div className="flex justify-end items-center gap-3">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={back}>
              Back
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={openScenes}>
              Cancel
            </Button>
          )}

          {step < 2 ? (
            <Button
              type="button"
              onClick={e => {
                e.preventDefault();
                next();
              }}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />}
              Create Global Scene
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AddGlobalSceneForm;
