import { IDevice } from '@/models/Device';
import { IFloor } from '@/models/Floor';

export async function fetchFloors(): Promise<IFloor[]> {
  const res = await fetch('/api/floors');
  if (!res.ok) throw new Error(`Failed to fetch floors: ${res.statusText}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch floors');
  return json.data as IFloor[];
}

export async function fetchDevices(floorId: string | null = null): Promise<IDevice[]> {
  const res = await fetch(`/api/devices${floorId ? `?floorId=${floorId}` : ''}`);
  if (!res.ok) throw new Error(`Failed to fetch devices: ${res.statusText}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch devices');
  return json.data as IDevice[];
}

export async function createFloorApi(name: string): Promise<IFloor> {
  const res = await fetch('api/floors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Failed to create floor: ${res.statusText}`);
  const json = await res.json();
  return json.data as IFloor;
}

export async function createDeviceApi(device: Partial<IDevice>): Promise<IDevice> {
  const res = await fetch('/api/devices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(device),
  });
  if (!res.ok) throw new Error(`Failed to create device: ${res.statusText}`);
  const json = await res.json();
  return json.data as IDevice;
}

export async function updateDeviceApi(deviceId: string, updates: Partial<IDevice>): Promise<IDevice> {
  const res = await fetch(`/api/devices/${deviceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update device: ${res.statusText}`);
  const json = await res.json();
  return json.data as IDevice;
}

export async function deleteDeviceApi(deviceId: string): Promise<void> {
  const res = await fetch(`/api/devices/${deviceId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete device: ${res.statusText}`);
}