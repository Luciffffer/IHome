import dbConnect from "@/lib/db";
import Floor, { IFloor, IFloorDocument } from "@/models/Floor";

function toIFloor(doc: IFloorDocument): IFloor {
    return {
        objectId: doc.id.toString(),
        name: doc.name,
        order: doc.order
    }

}

export class FloorService {
    static async getFloors(): Promise<IFloor[]> {
        await dbConnect();
        const floors = await Floor.find().sort({ order: 1 });
        return floors.map(toIFloor);
    }

    static async getFloorById(id: string): Promise<IFloor | null> {
        await dbConnect();
        const floor = await Floor.findById(id);
        return floor ? toIFloor(floor) : null;
    }

    static async createFloor(name: string): Promise<IFloor> {
        await dbConnect();
        const highestOrderFloor = await Floor.findOne().sort({ order: -1 });
        const newOrder = highestOrderFloor ? highestOrderFloor.order + 1 : 1;

        const newFloor = new Floor({
            name,
            order: newOrder
        });

        await newFloor.save();
        return toIFloor(newFloor);
    }
}