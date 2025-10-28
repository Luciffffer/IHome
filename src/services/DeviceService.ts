import dbConnect from "@/lib/db";
import Device, { getDefaultDeviceState, IDevice } from "@/models/Device";
import { FloorService } from "./FloorService";

export class DeviceService {
  // Get

  static async getDevicesByFloorId(floorId: string): Promise<IDevice[]> {
    await dbConnect();

    // Get room ids from the floor
    const floor = await FloorService.getFloorById(floorId);

    if (!floor) {
      return [];
    }

    const roomIds = floor.rooms.map(room => room.id);

    // Find devices in those rooms
    const devices = await Device.find({ roomId: { $in: roomIds } });
    return devices;
  }

  // Create

  static async createDevice(data: Partial<IDevice>): Promise<IDevice> {
    await dbConnect();

    const device = {
      ...data,
      state: getDefaultDeviceState(data.type!),
    }

    const created = await Device.create(device);
    return created as IDevice ;
  }
}