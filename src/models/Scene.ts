import mongoose from "mongoose";
import { IDevice } from "./Device";

export type SceneType = 'user' | 'global';

export type TimeSlot = {
  day: number; // 0 = Sunday, 6 = Saturday
  start: string; // "HH:MM" 24-hour format
  end: string;   // "HH:MM" 24-hour format
};

export interface IScene {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  enabled: boolean;
  type: SceneType;
  userId?: string;
  schedule?: TimeSlot[];
}

export interface ISceneAction {
  deviceId: string;
  state: Partial<IDevice['state']>;
}

export interface ISceneDocument extends IScene, Document {}

const SceneSchema = new mongoose.Schema<ISceneDocument>({
  name: { type: String, required: true, trim: true, maxLength: 32 },
  imageUrl: { type: String, required: false, trim: true },
  description: { type: String, required: false, trim: true, maxLength: 256 },
  enabled: { type: Boolean, required: true, default: true },
  type: { type: String, enum: ['user', 'global'], required: true },
  userId: { type: String, required: false },
  schedule: {
    type: [
      {
        day: { type: Number, required: true, min: 0, max: 6 },
        start: { type: String, required: true, regex: /^([01]\d|2[0-3]):[0-5]\d$/ },
        end: { type: String, required: true, regex: /^([01]\d|2[0-3]):[0-5]\d$/ },
      },
    ],
    required: false,
  }
});

export default mongoose.models.Scene || mongoose.model<ISceneDocument>('Scene', SceneSchema);