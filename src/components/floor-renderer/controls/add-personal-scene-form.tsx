import { useFloorUI } from '@/contexts/floor-ui-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@radix-ui/react-separator';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import DevicePicker from '../device-picker';
import { SceneDetailsFields } from '../scene-details-fields';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { createPersonalScene } from '@/contexts/scenes/api';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

const personalSceneSchema = z.object({
  devices: z
    .array(z.string().min(1, 'Invalid Device ID'))
    .min(1, 'At least one device is required'),
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

type PersonalSceneFormValues = z.infer<typeof personalSceneSchema>;

function AddPersonalSceneForm() {
  const { openScenes } = useFloorUI();
  const [step, setStep] = useState<0 | 1>(0);

  const form = useForm<PersonalSceneFormValues>({
    resolver: zodResolver(personalSceneSchema),
    defaultValues: {
      devices: [],
      name: '',
      description: '',
      imageUrl: '',
    },
    mode: 'onChange',
  });

  const mutation = useMutation({
    mutationFn: createPersonalScene,
    onSuccess: () => {
      toast.success('Personal scene created successfully.');
      openScenes();
    },
    onError: () => {
      toast.error('Failed to create personal scene. Please try again.');
    },
  });

  const handleFormSubmit = (data: PersonalSceneFormValues) => {
    mutation.mutate(data);
  };

  const next = async () => {
    const fieldsPerStep: Record<
      number,
      Array<keyof PersonalSceneFormValues>
    > = {
      0: ['devices'],
      1: ['name', 'imageUrl', 'description'],
    };
    const ok = await form.trigger(fieldsPerStep[step], { shouldFocus: true });
    if (ok) setStep(prev => (prev === 1 ? 1 : ((prev + 1) as 1)));
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
          2. Details
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
              <strong className="text-primary">current states</strong> of these
              devices will be saved and applied when the scene is activated.
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

          {step < 1 ? (
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
              Create Personal Scene
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AddPersonalSceneForm;
