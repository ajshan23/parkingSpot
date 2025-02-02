import mongoose, { Document } from "mongoose";

interface Ilocation extends Document {
    place: string;
    points: number[];
}

const locationSchema = new mongoose.Schema({
    place: {
        type: String,
        required: true,
        index: true,
    },
    points: [
        {
            type: Number
        }
    ]
}, { timestamps: true, versionKey: false })


const Location = mongoose.model<Ilocation>('Location', locationSchema);
export default Location;