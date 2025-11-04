import { Controller, UseFormReturn } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SceneDetailsFieldsProps {
  form: UseFormReturn<{
    name: string;
    description?: string;
    imageUrl?: string;
  }>;
}

export function SceneDetailsFields({ form }: SceneDetailsFieldsProps) {
  return (
    <>
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="mb-3">
            <FieldLabel htmlFor="scene-name">Scene Name</FieldLabel>
            <Input
              {...field}
              id="scene-name"
              placeholder="Enter scene name"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="imageUrl"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="mb-3">
            <FieldLabel
              htmlFor="scene-image-url"
              className="flex justify-between items-center"
            >
              <span>Scene Image URL</span>
              <span className="text-muted-foreground font-body-xs">
                (optional)
              </span>
            </FieldLabel>
            <Input
              {...field}
              id="scene-image-url"
              placeholder="Enter scene image URL"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="mb-3">
            <FieldLabel
              htmlFor="scene-description"
              className="flex justify-between items-center"
            >
              <span>Scene Description</span>
              <span className="text-muted-foreground font-body-xs">
                (optional)
              </span>
            </FieldLabel>
            <Textarea
              {...field}
              id="scene-description"
              placeholder="Enter scene description"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  );
}
