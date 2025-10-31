import { useEffect, useMemo, useState } from 'react';
import { IDevice, LightState } from '@/models/Device';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Lightbulb } from 'lucide-react';
import { useFloors } from '@/contexts/floors';

interface LightControlProps {
  device: IDevice;
}

const MIN_BRIGHTNESS = 0;
const MAX_BRIGHTNESS = 100;
const STEP = 1;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function LightControl({ device }: LightControlProps) {
  const { queueDeviceUpdate } = useFloors();
  const state = device.state as LightState | undefined;

  const initialOn = useMemo(() => state!.on ?? false, [state]);
  const initialBrightness = useMemo(
    () => clamp(state!.brightness, MIN_BRIGHTNESS, MAX_BRIGHTNESS),
    [state]
  );

  const [on, setOn] = useState<boolean>(initialOn);
  const [brightness, setBrightness] = useState<number>(initialBrightness);

  useEffect(() => {
    const extOn = state!.on;
    const extBrightness = clamp(
      state!.brightness,
      MIN_BRIGHTNESS,
      MAX_BRIGHTNESS
    );
    setOn(extOn);
    setBrightness(extBrightness);
  }, [state]);

  const pushUpdate = (partial: Partial<LightState>) => {
    queueDeviceUpdate(device.id, {
      state: {
        ...(device.state ?? {}),
        ...partial,
      } as LightState,
    });
  };

  const turnOn = () => {
    setOn(true);
    pushUpdate({ on: true });
  };
  const turnOff = () => {
    setOn(false);
    pushUpdate({ on: false });
  };

  const setB = (value: number) => {
    const next = clamp(value, MIN_BRIGHTNESS, MAX_BRIGHTNESS);
    setBrightness(next);
    pushUpdate({ brightness: next });
  };

  const glowIntensity = on ? brightness / 100 : 0;
  const glowStyle = {
    boxShadow: `0 0 ${8 + glowIntensity * 32}px ${
      glowIntensity * 16
    }px rgba(250, 204, 21, ${0.15 + glowIntensity * 0.35})`,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-body-sm">Light</div>
        <div className="text-muted-foreground text-body-sm">{brightness}%</div>
      </div>

      <div className="flex items-center justify-center">
        <div
          className="relative w-40 h-40 rounded-full bg-muted/50 border border-border flex items-center justify-center transition-shadow"
          style={glowStyle}
        >
          <Lightbulb
            className={`w-14 h-14 transition-colors ${
              on ? 'text-yellow-400' : 'text-muted-foreground'
            }`}
          />
          <div className="absolute inset-2 rounded-full pointer-events-none border border-border/60" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={on ? 'outline' : 'default'}
          onClick={turnOff}
          aria-label="Turn light off"
          className="min-w-16"
        >
          Off
        </Button>

        <Slider
          min={MIN_BRIGHTNESS}
          max={MAX_BRIGHTNESS}
          step={STEP}
          value={[brightness]}
          onValueChange={([v]) => setB(v)}
          aria-label="Brightness"
          className="flex-1"
        />

        <Button
          type="button"
          variant={on ? 'default' : 'outline'}
          onClick={turnOn}
          aria-label="Turn light on"
          className="min-w-16"
        >
          On
        </Button>
      </div>
    </div>
  );
}

export default LightControl;
