import mongoose, { Document } from "mongoose";
import { IRoom, IRoomDocument, roomDocToDto, roomSchema } from "./Room";

export interface IFloor {
    id: string;
    name: string;
    order: number;
    rooms: IRoom[];
    width?: number;
    length?: number;
}

export interface IFloorDocument extends Document {
    name: string;
    order: number;
    rooms: mongoose.Types.DocumentArray<IRoomDocument>;
    width: number;
    length: number;
}

const floorSchema = new mongoose.Schema<IFloorDocument>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 32,
    },
    order: {
        type: Number,
        required: false,
        default: 0
    },
    rooms: {
        type: [roomSchema],
        default: []
    },
    // computed footprint of the floor
    width: {
        type: Number,
        required: false,
        default: 0
    },
    length: {
        type: Number,
        required: false,
        default: 0
    }
});

export function normalizeFloorRooms(floor: IFloor): IFloor {
    console.log("Normalizing floor rooms and computing footprint...");
    if (!floor.rooms || floor.rooms.length === 0) {
        floor.width = 0;
        floor.length = 0;
        return floor;
    }

    // find minimum x/y across all rooms
    let minX = Infinity;
    let minY = Infinity;

    for (const room of floor.rooms) {
        const rx = typeof room.x === 'number' ? room.x : 0;
        const ry = typeof room.y === 'number' ? room.y : 0;
        if (rx < minX) minX = rx;
        if (ry < minY) minY = ry;
    }

    if (!isFinite(minX)) minX = 0;
    if (!isFinite(minY)) minY = 0;

    // shift all rooms so that minX and minY are at (0,0)
    if (minX !== 0 || minY !== 0) {
        for (const room of floor.rooms) {
            room.x = (typeof room.x === 'number' ? room.x : 0) - minX;
            room.y = (typeof room.y === 'number' ? room.y : 0) - minY;
        }
    }

    // compute width and length of the floor
    // find maximum x+width and y+length across all rooms
    let maxX = 0;
    let maxY = 0;
    for (const room of floor.rooms) {
        const rx = typeof room.x === 'number' ? room.x : 0;
        const ry = typeof room.y === 'number' ? room.y : 0;
        const rwidth = typeof room.width === 'number' ? room.width : 0;
        const rlength = typeof room.length === 'number' ? room.length : 0;

        if (rx + rwidth > maxX) maxX = rx + rwidth;
        if (ry + rlength > maxY) maxY = ry + rlength;
    }

    floor.width = maxX;
    floor.length = maxY;
    return floor;
} 

export default mongoose.models.Floor || mongoose.model<IFloorDocument>('Floor', floorSchema);

export function floorDocToDTO(floor: IFloorDocument): IFloor {
    return {
        id: floor.id.toString(),
        name: floor.name,
        order: floor.order,
        rooms: floor.rooms.map(roomDocToDto),
        width: floor.width,
        length: floor.length
    }
}