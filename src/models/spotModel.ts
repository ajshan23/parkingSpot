import mongoose, { Document, Schema } from "mongoose";

interface IParkingSpot extends Document {
    parkingSpotName: string;
    location: Number[];
    vehicleType: string;
    rate: { firstHour: number; additionalHour: number };
    isAvailable: boolean;
}

const ParkingSpotSchema: Schema = new mongoose.Schema<IParkingSpot>({
    parkingSpotName: {
        type: String,
        required: true
    },
    location: {
        type: [Number],
        double: true,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['car', 'bike'],
        required: true
    },
    rate: {
        firstHour: Number,
        additionalHour: Number
    },
    isAvailable:
    {
        type: Boolean,
        default: true
    }
}, { timestamps: true, versionKey: false });

ParkingSpotSchema.index({ location: "2dsphere" });

export default mongoose.model<IParkingSpot>('ParkingSpot', ParkingSpotSchema);