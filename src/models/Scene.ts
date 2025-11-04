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
  actions: ISceneAction[];
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
  enabled: { type: Boolean, required: true, default: false },
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
  },
  actions: {
    type: [
      {
        deviceId: { type: String, required: true },
        state: { type: Object, required: true },
      },
    ],
    required: true,
  }
});

export function sceneDocToDto(scene: ISceneDocument): IScene {
  return {
    id: scene.id.toString(),
    name: scene.name,
    imageUrl: scene.imageUrl,
    description: scene.description,
    enabled: scene.enabled,
    type: scene.type,
    userId: scene.userId,
    schedule: scene.schedule,
    actions: scene.actions,
  };
}

export default mongoose.models.Scene || mongoose.model<ISceneDocument>('Scene', SceneSchema);