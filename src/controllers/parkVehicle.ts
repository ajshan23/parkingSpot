import getCoordinates from "@/helpers/Location";
import Location from "@/models/locationCity";
import ParkRecord from "@/models/parkingRecord";
import ParkingSpot from "@/models/spotModel";
import { ApiResponse } from "@/utils/apiHandlerHelpers";
import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import mongoose from "mongoose";

export const searchAvailableSpot = asyncHandler(async (req: Request, res: Response) => {
    let { searchTerm, long, lat, vehicleType, maxDistance, limit, page } = req.query;
    const maxDistanceNumber = parseInt(maxDistance as string, 10);
    const limitNumber = parseInt(limit as string, 10) || 10;
    const pageNumber = parseInt(page as string, 10) || 1;
    const skip = (pageNumber - 1) * limitNumber;
    if (isNaN(maxDistanceNumber)) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid maxDistance value"));
    }

    if (lat && long) {
        const results = await ParkingSpot.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(long as string), parseFloat(lat as string)],
                    },
                    $maxDistance: maxDistanceNumber * 1000,
                },
            },
            vehicleType: vehicleType,
            isAvailable: true,
        }).skip(skip)
            .limit(limitNumber)
        return res.status(200).json(new ApiResponse(200, results, "Available spots fetched successfully"));
    }

    if (searchTerm) {
        const place = await Location.findOne({ place: searchTerm });


        if (place && place.points && place.points.length >= 2) {
            long = String(place.points[0]);
            lat = String(place.points[1]);

            const results = await ParkingSpot.find({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(long), parseFloat(lat)],
                        },
                        $maxDistance: maxDistanceNumber * 1000,
                    },
                },
                vehicleType: vehicleType,
                isAvailable: true,
            }).skip(skip)
                .limit(limitNumber)
            return res.status(200).json(new ApiResponse(200, results, "Available spots fetched successfully"));
        } else {

            const response = await getCoordinates(searchTerm as string);

            if (response === null) {
                return res.status(404).json(new ApiResponse(404, null, "Location not found"));
            } else {
                const newLat: number = response.lat;
                const newLon: number = response.lon;


                const newLocation = await Location.create({ place: searchTerm, points: [newLon, newLat] });

                const results = await ParkingSpot.find({
                    location: {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [newLon, newLat],
                            },
                            $maxDistance: maxDistanceNumber * 1000,
                        },
                    },
                    vehicleType: vehicleType,
                    isAvailable: true,
                }).skip(skip)
                    .limit(limitNumber)
                return res.status(200).json(new ApiResponse(200, results, "Available spots fetched successfully"));
            }
        }
    }
    return res.status(400).json(new ApiResponse(400, null, "Invalid search parameters"));
});


export const parkTheVehicle = asyncHandler(async (req: Request, res: Response) => {
    const { spotId, vehicleNumber } = req.body;
    const userId = req.user?.userId;
    if (!spotId || !mongoose.isValidObjectId(spotId)) {
        return res.status(400).json(new ApiResponse(400, {}, "Please provide parking spotid"));
    }
    const checkSpot = await ParkingSpot.findOne({
        _id: spotId,
        isAvailable: true,
    })

    if (!checkSpot) {
        return res.status(400).json(new ApiResponse(400, {}, "Parking spot not available"));
    }
    checkSpot.isAvailable = false;
    const reserveSpot = await ParkRecord.create({
        vehicleNumber: vehicleNumber,
        userId,
        hourlyRate: checkSpot.rate.firstHour,
        additionalHourRate: checkSpot.rate.additionalHour,
        spot: spotId
    })

    if (reserveSpot) {
        await checkSpot.save();
        //can add qr code if required
        return res.status(201).json(new ApiResponse(201, reserveSpot, "spot allocated successfully"))
    } else {
        return res.status(201).json(new ApiResponse(400, {}, "spot allocation failed"))

    }
})

export const getParkedVehicle = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const activeParkingRecords = await ParkRecord.find({
        userId: userId,
        checkedOutAt: { $exists: false }
    }).populate('spot');

    if (!activeParkingRecords.length) {
        return res.status(202).json(new ApiResponse(202, [], "No active parking records found"));
    }
    return res.status(200).json(new ApiResponse(200, activeParkingRecords, "Active Parking data fetched successfully"))
})

export const checkOut = asyncHandler(async (req: Request, res: Response) => {
    const { parkingRecordId } = req.body;
    const userId = req.user?.userId;
    if (!parkingRecordId || !mongoose.isValidObjectId(parkingRecordId)) {
        return res.status(400).json(new ApiResponse(400, {}, "Please provide record id"));
    }
    const activeRecord = await ParkRecord.findOne({
        _id: parkingRecordId,
        userId: userId,
        checkedOutAt: { $exists: false }
    });

    if (!activeRecord) {
        return res.status(404).json(new ApiResponse(404, {}, "No active parking record found for this record"));
    }
    const parkedAt = new Date(activeRecord.parkedAt);
    const checkedOutAt = new Date();
    const durationInHours = Math.ceil((checkedOutAt.getTime() - parkedAt.getTime()) / (3600000));
    let totalFee = activeRecord.hourlyRate;
    if (durationInHours > 1) {
        totalFee += (durationInHours - 1) * activeRecord.additionalHourRate;
    }
    activeRecord.checkedOutAt = checkedOutAt;
    activeRecord.totalFee = totalFee;
    await activeRecord.save();
    const data = await ParkingSpot.findByIdAndUpdate(activeRecord.spot, {
        $set: {
            isAvailable: true
        }
    }, { new: true })
    console.log("data:", data);

    return res.status(200).json(new ApiResponse(200, { totalFee, durationInHours }, "Checkout successful"));
})