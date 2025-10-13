import mongoose, { Document } from "mongoose";

export interface IFloor {
    name: string;
    order: number;
}

export interface IFloorDocument extends IFloor, Document {}

const floorSchema = new mongoose.Schema<IFloorDocument>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    order: {
        type: Number,
        required: false,
        default: 0
    }
});

export default mongoose.models.Floor || mongoose.model<IFloor>('Floor', floorSchema);