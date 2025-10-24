import { useEffect } from 'react';
import { IRoom } from '@/models/Room';
import { worldToScreen } from '../utils/coordinates';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Trash, WholeWord } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DEFAULT_ROOM_COLORS } from '../floor-plan-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GRID_SIZE } from '../utils/grid';
import { useFloor } from '@/contexts/floor-context';

interface RoomPropertiesPanelProps {
  room: IRoom;
  pan: { x: number; y: number };
  zoom: number;
  onUpdateProperty: (property: keyof IRoom, value: unknown) => void;
}

const propertiesSchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(32, 'Name cannot exceed 32 characters'),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, 'Invalid color format'),
});

export function RoomPropertiesPanel({
  room,
  pan,
  zoom,
  onUpdateProperty,
}: RoomPropertiesPanelProps) {
  const { deleteRoom } = useFloor();

  const form = useForm<z.infer<typeof propertiesSchema>>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: {
      name: room.name,
      color: room.color,
    },
  });

  // Update local state when room changes
  useEffect(() => {
    form.setValue('name', room.name);
    form.setValue('color', room.color);
  }, [room, form]);

  // Listen for delete key to delete room
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        event.preventDefault();
        deleteRoom(room.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [room.id, deleteRoom]);

  // Position the panel above the room
  const position = worldToScreen(
    room.x * GRID_SIZE + (room.width * GRID_SIZE) / 2,
    room.y * GRID_SIZE,
    pan,
    zoom
  );

  // Handle form field changes
  const handleFieldChange = (field: keyof IRoom, value: unknown) => {
    if (value) {
      onUpdateProperty(field, value);
    }
  };

  return (
    <form
      className="absolute bg-background shadow-md rounded-md p-3 z-10 transform 
        -translate-x-1/2 -translate-y-full mb-2 flex items-center gap-3"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 12}px`,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Modal for changing room settings"
      onSubmit={e => e.preventDefault()}
    >
      <FieldGroup className="w-64 flex gap-3 items-center flex-row">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <FieldLabel htmlFor={field.name}>
                <WholeWord />
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                onChange={e => {
                  field.onChange(e);
                  if (e.target.value.trim().length > 0) {
                    handleFieldChange('name', e.target.value);
                  }
                }}
              />
            </Field>
          )}
        />
        <Select
          value={form.watch('color')}
          onValueChange={value => {
            form.setValue('color', value);
            handleFieldChange('color', value);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_ROOM_COLORS.map(color => (
              <SelectItem key={color} value={color}>
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldGroup>
      <Button
        variant="ghost"
        onClick={() => deleteRoom(room.id)}
        type="button"
        size="icon"
      >
        <Trash />
      </Button>
    </form>
  );
}
