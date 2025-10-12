import mongoose, { Document } from "mongoose";

export interface IFloor extends Document {
    name: string;
    order: number;
}

const floorSchema = new mongoose.Schema<IFloor>({
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