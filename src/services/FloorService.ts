import dbConnect from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import Floor, { floorDocToDTO, IFloor, IFloorDocument, normalizeFloorRooms } from "@/models/Floor";
import { DeviceService } from "./DeviceService";
import { IRoom } from "@/models/Room";

export class FloorService {
    // Get

    static async getFloors(): Promise<IFloor[]> {
        await dbConnect();
        const floors = await Floor.find().sort({ order: 1 });
        return floors.map(floorDocToDTO);
    }

    static async getFloorById(id: string): Promise<IFloor | null> {
        await dbConnect();
        const floor = await Floor.findById<IFloorDocument>(id);
        return floor ? floorDocToDTO(floor) : null;
    }

    // Create

    static async createFloor(name: string): Promise<IFloor> {
        await dbConnect();
        const highestOrderFloor = await Floor.findOne().sort({ order: -1 });
        const newOrder = highestOrderFloor ? highestOrderFloor.order + 1 : 1;

        const newFloor = new Floor({
            name,
            order: newOrder
        });

        await newFloor.save();
        return floorDocToDTO(newFloor);
    }

    static async updateFloor(id: string, data: Partial<IFloor>): Promise<IFloor> {
        await dbConnect();
        const floorDoc = await Floor.findById(id);

        if (!floorDoc) {
            throw new NotFoundError('Floor', id);
        }

        // Check for devices and remove them
        await DeviceService.removeDevicesByRoomIds(floorDoc.rooms.map((room: IRoom) => room.id));

        if (data.name !== undefined) floorDoc.name = data.name;
        if (data.order !== undefined) floorDoc.order = data.order;
        if (data.rooms !== undefined) floorDoc.rooms = data.rooms;

        normalizeFloorRooms(floorDoc);

        await floorDoc.save();
        return floorDocToDTO(floorDoc);
    }

    // Delete

    static async deleteFloor(id: string): Promise<void> {
        await dbConnect();
        const floor = await Floor.findById(id);

        if (!floor) {
            throw new NotFoundError('Floor', id);
        }

        // Check for devices and remove them
        await DeviceService.removeDevicesByRoomIds(floor.rooms.map((room: IRoom) => room.id));

        await floor.remove();
    }
}