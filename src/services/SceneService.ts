import { GlobalScenePostBody } from "@/app/api/scenes/global/route";
import dbConnect from "@/lib/db";
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "@/lib/errors";
import Scene, { IScene, ISceneAction, sceneDocToDto } from "@/models/Scene";
import { DeviceService } from "./DeviceService";
import { PersonalScenePostBody } from "@/app/api/scenes/mine/route";
import { IUser } from "@/models/User";
import { getDefaultDeviceState, IDevice } from "@/models/Device";
import { toMinutes } from "@/lib/utils/time";
import { findScheduleConflicts } from "@/lib/utils/schedule";

export class SceneService {
  // Get

  static async getAllGlobalScenes(): Promise<IScene[]> {
    await dbConnect();
    const scenes = await Scene.find({ type: 'global' });

    // sort based on next scheduled time and day
    scenes.sort((a, b) => {
      const now = new Date();
      const aNext = a.schedule ? a.schedule
        .map((slot: { day: number; start: string; end: string; }) => {
          let dayDiff = (slot.day + 7 - now.getDay()) % 7;
          const slotStartMinutes = toMinutes(slot.start);
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          if (dayDiff === 0 && slotStartMinutes <= nowMinutes) {
            dayDiff += 7;
          }
          return dayDiff * 1440 + slotStartMinutes;
        })
        .reduce((min: number, curr: number) => Math.min(min, curr), Infinity) : Infinity;
      const bNext = b.schedule ? b.schedule
        .map((slot: { day: number; start: string; end: string; }) => {
          let dayDiff = (slot.day + 7 - now.getDay()) % 7;
          const slotStartMinutes = toMinutes(slot.start);
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          if (dayDiff === 0 && slotStartMinutes <= nowMinutes) {
            dayDiff += 7;
          }
          return dayDiff * 1440 + slotStartMinutes;
        })
        .reduce((min: number, curr: number) => Math.min(min, curr), Infinity) : Infinity;

      return aNext - bNext;
    });

    return scenes.map(sceneDocToDto);
  }

  static async getScenesByUserId(userId: string) {
    await dbConnect();
    if (!userId) throw new UnauthorizedError();
    const scenes = await Scene.find({ userId: userId });
    return scenes.map(sceneDocToDto);
  }

  // Create

  static async createGlobalScene(data: GlobalScenePostBody): Promise<IScene> {
    await dbConnect();
    const existing = await this.getAllGlobalScenes();

    if (!data.schedule) throw new ValidationError('Schedule is required for global scenes');

    // Check for schedule conflicts
    const conflicts = findScheduleConflicts(data.schedule, existing);

    if (conflicts.length > 0) {
      throw new ValidationError('Schedule conflicts with existing global scenes');
    }

    const actions = await this.getSceneActionsFromDeviceIds(data.devices);

    const scene = await Scene.create({
      ...data,
      type: 'global',
      schedule: data.schedule,
      actions,
    });
    return sceneDocToDto(scene);
  }

  static async createPersonalScene(data: PersonalScenePostBody, userId: string): Promise<IScene> {
    await dbConnect();

    if (!userId) throw new UnauthorizedError();

    if (data.devices.length === 0) {
      throw new ValidationError('At least one device is required to create a personal scene');
    }

    const actions = await this.getSceneActionsFromDeviceIds(data.devices);

    const scene = await Scene.create({
      ...data,
      type: 'user',
      userId,
      actions,
    });
    return sceneDocToDto(scene);
  }

  // Delete

  static async deleteScene(id: string, user: IUser): Promise<void> {
    await dbConnect();
    const scene = await Scene.findById(id);
    if (!scene) throw new NotFoundError('scene', id);

    if ((scene.type === 'user' && scene.userId !== user.id)
      || (scene.type === 'global' && user.role !== 'admin')) {
      throw new ForbiddenError('You do not have permission to delete this scene');
    }

    await Scene.deleteOne({ _id: id });
  }

  // Activate

  static async activateScene(id: string, user: IUser | null): Promise<void> {
    await dbConnect();
    const scene = await Scene.findById(id);
    if (!scene) throw new NotFoundError('scene', id);

    if (user !== null) {
      if ((scene.type === 'user' && scene.userId !== user.id)
        || (scene.type === 'global' && user.role !== 'admin')) {
        throw new ForbiddenError('You do not have permission to activate this scene');
      }
    }

    await Promise.all(scene.actions.map(async (action: ISceneAction) => {
      const device = await DeviceService.getDeviceById(action.deviceId);
      await DeviceService.updateDevice(device.id, { state: { ...device.state, ...action.state } } as Partial<IDevice>);
    }));

    scene.enabled = true;
    await scene.save();
  }

  // Deactivate
  static async deactivateScene(id: string, user: IUser | null): Promise<void> {
    await dbConnect();
    const scene = await Scene.findById(id);
    if (!scene) throw new NotFoundError('scene', id);

    if (user !== null) {
      if ((scene.type === 'user' && scene.userId !== user.id)
        || (scene.type === 'global' && user.role !== 'admin')) {
        throw new ForbiddenError('You do not have permission to deactivate this scene');
      }
    }

    await Promise.all(scene.actions.map(async (action: ISceneAction) => {
      const device = await DeviceService.getDeviceById(action.deviceId);
      await DeviceService.updateDevice(device.id, { state: { ...device.state, ...getDefaultDeviceState(device.type) }} as Partial<IDevice>);
    }));

    scene.enabled = false;
    await scene.save();
  }

  // helpers

  static async getSceneActionsFromDeviceIds(deviceIds: string[]): Promise<ISceneAction[]> {
    if (deviceIds.length === 0) {
      throw new ValidationError('At least one device is required to create a global scene');
    }

    const deviceStates = await Promise.all(deviceIds.map(async (deviceId) => {
      const device = await DeviceService.getDeviceById(deviceId);
      return device.state;
    }));

    const actions: ISceneAction[] = deviceIds.map((deviceId, index) => ({
      deviceId,
      state: deviceStates[index],
    }));

    return actions;
  }

  static async removeDeviceFromScenes(deviceId: string): Promise<void> {
    await dbConnect();
    await Scene.updateMany(
      { 'actions.deviceId': deviceId },
      { $pull: { actions: { deviceId } } }
    );
    await this.removeEmptyScenes();
  }

  static async removeDevicesFromScenesByRoomIds(roomIds: string[]): Promise<void> {
    await dbConnect();
    const devices = await DeviceService.getDevices();
    const deviceIdsToRemove = devices
      .filter(device => roomIds.includes(device.roomId))
      .map(device => device.id);

    await Promise.all(deviceIdsToRemove.map(deviceId => this.removeDeviceFromScenes(deviceId)));
  }

  static async removeEmptyScenes(): Promise<void> {
    await dbConnect();
    await Scene.deleteMany({ actions: { $size: 0 } });
  }
}