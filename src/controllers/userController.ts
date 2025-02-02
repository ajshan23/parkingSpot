import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/apiHandlerHelpers';
import { generateToken } from '@/helpers/Token';


export const register = asyncHandler(async (req: Request, res: Response) => {

    const { username, email, password } = req.body;

    if ([username, email, password].some((f) => f.trim() === "")) {
        return res.status(400).json(new ApiResponse(400, {}, "All fields required"));
    }
    if (password.length < 6) {
        return res.status(400).json(new ApiResponse(400, {}, "password must be atlast 6 characters"));
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json(new ApiResponse(400, {}, "User already exists"));
    }

    // Create new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json(new ApiResponse(200, {}, "User created successfully"));
})

export const login = asyncHandler(async (req: Request, res: Response) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json(new ApiResponse(400, {}, "Invalid credentials"));
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(400).json(new ApiResponse(400, {}, "Invalid credentials"));
    }
    const token = generateToken(user._id as string);

    res.status(200).json(new ApiResponse(200, { token }, "Login successful"));

})