import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { IDevice, ThermostatState } from '@/models/Device';
import { useFloors } from '@/contexts/floors-context';
import { Slider } from '@/components/ui/slider';

interface ThermostatControlProps {
  device: IDevice;
}

const MIN_TEMP = 10;
const MAX_TEMP = 30;
const STEP = 1;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function ThermostatControl({ device }: ThermostatControlProps) {
  const { queueDeviceUpdate } = useFloors();

  const state = device.state as ThermostatState;
  const initial = useMemo(
    () => clamp(state?.temperature ?? 20, MIN_TEMP, MAX_TEMP),
    [state?.temperature]
  );

  const [temp, setTemp] = useState<number>(initial);

  const tempRef = useRef<number>(initial);
  useEffect(() => {
    tempRef.current = temp;
  }, [temp]);

  // sync to external device temperature changes
  useEffect(() => {
    const external = clamp(state?.temperature ?? initial, MIN_TEMP, MAX_TEMP);
    setTemp(external);
  }, [initial, state?.temperature]);

  const pushUpdate = (value: number) => {
    const next = clamp(value, MIN_TEMP, MAX_TEMP);
    queueDeviceUpdate(device.id, {
      state: {
        ...(device.state ?? {}),
        temperature: next,
      } as ThermostatState,
    });
  };

  const inc = () => {
    setTemp(t => {
      const next = clamp(t + STEP, MIN_TEMP, MAX_TEMP);
      pushUpdate(next);
      return next;
    });
  };

  const dec = () =>
    setTemp(t => {
      const next = clamp(t - STEP, MIN_TEMP, MAX_TEMP);
      pushUpdate(next);
      return next;
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-body-sm">
          Set temperature
        </div>
        <div className="text-muted-foreground text-body-sm">
          {MIN_TEMP}° — {MAX_TEMP}°
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative w-44 h-44 rounded-full bg-muted/50 border border-border flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-semibold leading-none">{temp}°</div>
            <div className="text-muted-foreground text-xs mt-1">Celsius</div>
          </div>

          <div className="absolute inset-2 rounded-full pointer-events-none border border-border/60" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={dec}
          aria-label="Decrease temperature"
        >
          &minus;
        </Button>

        <Slider
          min={MIN_TEMP}
          max={MAX_TEMP}
          step={STEP}
          value={[temp]}
          onValueChange={value => {
            const next = clamp(value[0], MIN_TEMP, MAX_TEMP);
            setTemp(next);
            pushUpdate(next);
          }}
          aria-label="Temperature"
          className="flex-1 accent-foreground"
        />

        <Button
          type="button"
          variant="outline"
          onClick={inc}
          aria-label="Increase temperature"
        >
          +
        </Button>
      </div>
    </div>
  );
}

export default ThermostatControl;
