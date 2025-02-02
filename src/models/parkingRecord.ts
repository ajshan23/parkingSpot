import mongoose, { Document, Schema, Types } from "mongoose";

interface IParkingRecord extends Document {
    vehicleNumber: string;
    userId: string;
    spot: Types.ObjectId;
    parkedAt: Date;
    checkedOutAt?: Date;
    totalFee?: number;
    hourlyRate: number;
    additionalHourRate: number;
}

const ParkingRecordSchema: Schema = new mongoose.Schema<IParkingRecord>({
    vehicleNumber: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    spot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingSpot',
        required: true
    },
    parkedAt: {
        type: Date,
        default: Date.now
    },
    checkedOutAt: {
        type: Date

    },
    totalFee: {
        type: Number,
        default: 0
    },
    hourlyRate: {
        type: Number,
        required: true,
    },
    additionalHourRate: {
        type: Number,
        required: true,
    },
}, { timestamps: true, versionKey: false });

const ParkRecord = mongoose.model<IParkingRecord>('ParkingRecord', ParkingRecordSchema);
export default ParkRecord;