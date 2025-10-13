import dbConnect from "@/lib/db";
import Floor, { IFloor } from "@/models/Floor";

export class FloorService {
    static async getFloors(): Promise<IFloor[]> {
        await dbConnect();
        const floors = await Floor.find().sort({ order: 1 });
        return floors;
    }
}