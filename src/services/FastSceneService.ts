import dbConnect from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import Device, { AudioState, DoorLockState, getDefaultDeviceState, LightState } from "@/models/Device";

export class FastSceneService {

  static async executeFastScene(actionId: string): Promise<void> {
    switch (actionId) {
      case 'lock-all-doors':
        await this.executeLockAllDoors();
        break;
      case 'unlock-all-doors':
        await this.executeUnlockAllDoors();
        break;
      case 'lights-off':
        await this.executeTurnOffAllLights();
        break;
      case 'mute-all-audio':
        await this.executeMuteAllAudio();
        break;
      case 'emergency-shutdown':
        await this.executeEmergencyShutdown();
        break;
      default:
        throw new NotFoundError('Fast Action', actionId);
    }
  }

  // Execute fast scenes

  static async executeLockAllDoors() {
    await dbConnect();
    const doorLocks = await Device.find({ type: 'door-lock' });

    for (const lock of doorLocks) {
      lock.state = { locked: true } as DoorLockState;
      await lock.save();
    }
  }

  static async executeUnlockAllDoors() {
    await dbConnect();
    const doorLocks = await Device.find({ type: 'door-lock' });

    for (const lock of doorLocks) {
      lock.state = { locked: false } as DoorLockState;
      await lock.save();
    }
  }

  static async executeTurnOffAllLights() {
    await dbConnect();
    const lights = await Device.find({ type: 'light' });

    for (const light of lights) {
      light.state = { on: false } as LightState;
      await light.save();
    }
  }

  static async executeMuteAllAudio() {
    await dbConnect();
    const audioDevices = await Device.find({ type: 'audio' });
    for (const audio of audioDevices) {
      audio.state = { volume: 0 } as AudioState;
      await audio.save();
    }
  }

  static async executeEmergencyShutdown() {
    await dbConnect();
    const devices = await Device.find();

    for (const device of devices) {
      device.state = getDefaultDeviceState(device.type);
      await device.save();
    }
  }
}