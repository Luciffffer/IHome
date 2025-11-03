import { findScheduleConflicts } from "@/components/floor-renderer/utils/schedule-conflicts";
import dbConnect from "@/lib/db";
import { ValidationError } from "@/lib/errors";
import Scene, { IScene } from "@/models/Scene";

export class SceneService {
  // Get

  static async getAllGlobalScenes(): Promise<IScene[]> {
    await dbConnect();
    const scenes = await Scene.find({ type: 'global' });
    return scenes as IScene[];
  }

  static async getScenesByUserId(userId: string) {
    await dbConnect();
    const scenes = await Scene.find({ userId });
    return scenes as IScene[];
  }

  // Create

  static async createGlobalScene(data: Partial<IScene>): Promise<IScene> {
    await dbConnect();
    const existing = await this.getAllGlobalScenes();

    if (!data.schedule) throw new ValidationError('Schedule is required for global scenes');

    // Check for schedule conflicts
    const conflicts = findScheduleConflicts(data.schedule, existing);

    if (conflicts.length > 0) {
      throw new ValidationError('Schedule conflicts with existing global scenes');
    }

    const scene = await Scene.create({
      ...data,
      type: 'global',
      schedule: data.schedule,
    });
    return scene as IScene;
  }
}