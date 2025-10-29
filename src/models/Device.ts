import mongoose, { Document } from "mongoose";

export type DeviceType = 'light' | 'thermostat' | 'door-lock' | 'audio';

export interface IDeviceBase {
  id: string,
  name: string,
  type: DeviceType,
  upcCode: string,
  roomId: string,
  x: number,
  y: number,
  description: string 
}

export interface LightState {
  on: boolean;
  brightness: number; // 0-100
}

export interface ThermostatState {
  temperature: number; // in Celsius between 10 and 30
}

export interface DoorLockState {
  locked: boolean
}

export interface AudioState {
  playlist: string;
  volume: number; // 0-20
}

export type IDevice =
  | (IDeviceBase & { type: 'light'; state: LightState })
  | (IDeviceBase & { type: 'thermostat'; state: ThermostatState })
  | (IDeviceBase & { type: 'door-lock'; state: DoorLockState })
  | (IDeviceBase & { type: 'audio'; state: AudioState });

export function getDefaultDeviceState(type: DeviceType) : IDevice['state'] {
  switch(type) {
    case 'light':
      return { on: false, brightness: 100 };
    case 'thermostat':
      return { temperature: 16 };
    case 'door-lock':
      return { locked: false };
    case 'audio':
      return { playlist: 'classic', volume: 0 };
  }
}

export interface IDeviceDocument extends Document {
  name: string,
  type: DeviceType,
  upcCode: string,
  roomId: mongoose.Types.ObjectId,
  x: number,
  y: number,
  description: string,
  state: LightState | ThermostatState | DoorLockState | AudioState
}

const deviceSchema = new mongoose.Schema<IDeviceDocument>({
  name: { type: String, required: true, maxLength: 32, trim: true },
  type: { type: String, required: true, enum: ['light', 'thermostat', 'door-lock', 'audio'] },
  upcCode: { type: String, required: true, trim: true, length: 13 },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  description: { type: String, required: false, maxLength: 256, trim: true, default: '' },
  state: { type: mongoose.Schema.Types.Mixed, required: true }
});

export default mongoose.models.Device || mongoose.model<IDeviceDocument>('Device', deviceSchema);

export function deviceDocToDto(doc: IDeviceDocument): IDevice {
  return {
    id: doc.id.toString(),
    name: doc.name,
    type: doc.type,
    upcCode: doc.upcCode,
    roomId: doc.roomId.toString(),
    x: doc.x,
    y: doc.y,
    description: doc.description,
    state: doc.state
  } as unknown as IDevice;
}