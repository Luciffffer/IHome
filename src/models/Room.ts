import mongoose, { Document } from "mongoose";

export interface IRoom {
    objectId: string;
    name: string;
    width: number;
    length: number;
    x: number;
    y: number;
    color: string;
}

export interface IRoomDocument extends IRoom, Document {}

const roomSchema = new mongoose.Schema<IRoomDocument>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    width: {
        type: Number,
        required: true,
        min: [1, 'Width must be at least 1m' ]
    },
    length: {
        type: Number,
        required: true,
        min: [1, 'Length must be at least 1m' ]
    },
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        required: true,
        trim: true
    }
});

export default mongoose.models.Room || mongoose.model<IRoom>('Room', roomSchema);