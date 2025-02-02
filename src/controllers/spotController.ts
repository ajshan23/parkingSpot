import { Request, Response } from 'express';
import ParkingSpot from '../models/spotModel';
import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/apiHandlerHelpers';
import mongoose from 'mongoose';

// Add a new parking spot
export const addSpot = asyncHandler(async (req: Request, res: Response) => {
    const { long, lat, parkingSpotName, vehicleType, firstHourRate, additionalHourRate } = req.body;

    if (!long || !lat || !parkingSpotName || !vehicleType || !firstHourRate || !additionalHourRate) {
        return res.status(400).json(new ApiResponse(400, {}, "All fields are required"));
    }
    const spotCheck = await ParkingSpot.find({
        parkingSpotName: parkingSpotName
    })
    console.log(spotCheck);

    if (spotCheck.length > 0) {
        return res.status(400).json(new ApiResponse(400, {}, "Name must be unique, this name is already taken by another spot"));
    }
    const newSpot = new ParkingSpot({
        parkingSpotName: parkingSpotName,
        location: [long as number, lat as number],
        vehicleType: vehicleType,
        rate: {
            firstHour: firstHourRate,
            additionalHour: additionalHourRate,

        },
    });
    await newSpot.save();

    res.status(201).json(new ApiResponse(201, { spot: newSpot }, "Parking spot added successfully"));
});

export const editSpot = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { long, lat, parkingSpotName, vehicleType, firstHourRate, additionalHourRate } = req.body;

    if (!long || !lat || !parkingSpotName || !vehicleType || !firstHourRate || !additionalHourRate) {
        return res.status(400).json(new ApiResponse(400, {}, "All fields are required"));
    }
    const spotCheck = await ParkingSpot.find({
        parkingSpotName: parkingSpotName,
        _id: {
            $ne: id
        }
    })
    if (spotCheck.length > 0) {
        return res.status(400).json(new ApiResponse(400, {}, "Name must be unique, this name is already taken by another spot"));
    }
    const updatedSpot = await ParkingSpot.findByIdAndUpdate(id, {
        parkingSpotName,
        location: [long as number, lat as number],
        vehicleType,
        rate: {
            firstHour: firstHourRate,
            additionalHour: additionalHourRate,
        },
    }, { new: true });

    if (!updatedSpot) {
        return res.status(404).json(new ApiResponse(404, {}, "Parking spot not found"));
    }

    res.status(200).json(new ApiResponse(200, { spot: updatedSpot }, "Parking spot updated successfully"));
});

export const deleteSpot = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {

    }
    const deletedSpot = await ParkingSpot.findByIdAndDelete(id);

    if (!deletedSpot) {
        return res.status(404).json(new ApiResponse(404, {}, "Parking spot not found"));
    }

    res.status(200).json(new ApiResponse(200, {}, "Parking spot deleted successfully"));
});
