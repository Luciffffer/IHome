import dbConnect from "@/lib/db";
import Device, { deviceDocToDto, getDefaultDeviceState, IDevice } from "@/models/Device";
import { FloorService } from "./FloorService";
import { NotFoundError } from "@/lib/errors";

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
    return devices.map(deviceDocToDto);
  }

  static async getDevices(): Promise<IDevice[]> {
    await dbConnect();
    const devices = await Device.find();
    return devices.map(deviceDocToDto);
  }

  // Create

  static async createDevice(data: Partial<IDevice>): Promise<IDevice> {
    await dbConnect();

    const device = {
      ...data,
      state: getDefaultDeviceState(data.type!),
    }

    const created = await Device.create(device);
    return deviceDocToDto(created);
  }

  // Update

  static async updateDevice(id: string, data: Partial<IDevice>): Promise<IDevice | null> {
    await dbConnect();
    const device = await Device.findByIdAndUpdate(id, data, { new: true });
    if (!device) throw new NotFoundError('Device', id);
    return deviceDocToDto(device);
  }

  // Delete

  static async deleteDevice(id: string): Promise<void> {
    await dbConnect();
    const result = await Device.findByIdAndDelete(id);
    if (!result) throw new NotFoundError('Device', id);
  }
}