import { useCallback, useEffect, useMemo, useRef } from 'react';
import { queryClient } from '@/components/react-query-provider';
import { IDevice } from '@/models/Device';
import { devicesKey } from './keys';

type UpdateFn = (deviceId: string, updates: Partial<IDevice>) => Promise<IDevice>;

function mergeShallowWithState(a: Partial<IDevice>, b: Partial<IDevice>): Partial<IDevice> {
  const merged = { ...a, ...b } as Partial<IDevice>;
  if (a.state && b.state) {
    merged.state = { ...a.state, ...b.state } as typeof a.state;
  } else if (b.state) {
    merged.state = b.state;
  } else if (a.state) {
    merged.state = a.state;
  }
  return merged;
}

export function useDeviceUpdateQueue(
  floorId: string | null | undefined,
  updateDevice: UpdateFn,
  debounceMs = 1000
) {
  const pendingRef = useRef<Map<string, { timer: number | null; updates: Partial<IDevice> }>>(
    new Map()
  );

  const hasPendingref = useRef<boolean>(false);
  const optimisticOverlayRef = useRef<Map<string, Partial<IDevice>>>(new Map());

  const applyOptimistic = useCallback( async (deviceId: string, updates: Partial<IDevice>) => {
    hasPendingref.current = true;

    const existing = optimisticOverlayRef.current.get(deviceId) || {};
    optimisticOverlayRef.current.set(deviceId, mergeShallowWithState(existing, updates));

    await queryClient.cancelQueries({ queryKey: devicesKey(floorId) });

    queryClient.setQueryData<IDevice[]>(devicesKey(floorId), old =>
      (old ?? []).map(d => (d.id === deviceId ? (mergeShallowWithState(d, updates) as IDevice) : d))
    );
  }, [floorId]);

  const queueDeviceUpdate = useCallback((deviceId: string, updates: Partial<IDevice>) => {
    // optimistic UI
    applyOptimistic(deviceId, updates);

    // merge into pending
    const entry = pendingRef.current.get(deviceId) ?? { timer: null, updates: {} };
    entry.updates = mergeShallowWithState(entry.updates || {}, updates);

    // debounced send
    if (entry.timer) clearTimeout(entry.timer);
    entry.timer = window.setTimeout(() => {
      updateDevice(deviceId, entry.updates)
        .catch(() => {
          // do nothing. Invalidation will refetch latest data
        })
        .finally(() => {
          const e = pendingRef.current.get(deviceId);
          if (e) {
            e.timer = null;
            e.updates = {};
          }

          const hasOtherPending = Array.from(pendingRef.current.values()).some(
            entry => entry.timer !== null && Object.keys(entry.updates).length > 0
          );

          if (!hasOtherPending) {
            hasPendingref.current = false;
            optimisticOverlayRef.current.clear();
            queryClient.invalidateQueries({ queryKey: devicesKey(floorId) });
          }
        });
    }, debounceMs);

    pendingRef.current.set(deviceId, entry);
  }, [applyOptimistic, debounceMs, updateDevice, floorId]);

  const flushDeviceUpdates = useCallback(async (deviceId: string) => {
    const entry = pendingRef.current.get(deviceId);
    if (!entry) return;
    if (entry.timer) {
      clearTimeout(entry.timer);
      entry.timer = null;
    }
    const payload = entry.updates;
    if (!payload || Object.keys(payload).length === 0) {
      return;
    }
    await updateDevice(deviceId, payload);
    entry.updates = {};

    const hasOtherPending = Array.from(pendingRef.current.values()).some(
      entry => entry.timer !== null && Object.keys(entry.updates).length > 0
    );
    if (!hasOtherPending) {
      hasPendingref.current = false;
      queryClient.invalidateQueries({ queryKey: devicesKey(floorId) });
    }
  }, [updateDevice, floorId]);

  const hasPendingUpdates = useCallback(() => hasPendingref.current, []);

  const applyOverlay = useCallback((devices: IDevice[]): IDevice[] => {
    if (optimisticOverlayRef.current.size === 0) return devices;

    return devices.map(d => {
      const overlay = optimisticOverlayRef.current.get(d.id);
      return overlay ? (mergeShallowWithState(d, overlay) as IDevice) : d;
    })
  }, []);

  // Best effort flush on unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      pendingRef.current.forEach((entry, deviceId) => {
        if (entry.timer) clearTimeout(entry.timer);
        if (entry.updates && Object.keys(entry.updates).length > 0) {
          fetch(`/api/devices/${deviceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry.updates),
            keepalive: true,
          });
          entry.updates = {};
        }
      });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const api = useMemo(() => ({ 
    queueDeviceUpdate, 
    flushDeviceUpdates,
    hasPendingUpdates,
    applyOverlay
  }), 
  [queueDeviceUpdate, flushDeviceUpdates, hasPendingUpdates, applyOverlay]);

  return api;
}