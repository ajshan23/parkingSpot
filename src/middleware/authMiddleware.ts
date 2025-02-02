import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import { Types } from 'mongoose';

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET! || "asd";



const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {  // Make sure the return type is void
    const authHeader = req.headers['authorization'];
    console.log(SECRET_KEY);
    if (!authHeader) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Token missing' });
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { id: string };

        // Find user by decoded id
        const user = await User.findById(decoded.id).select("_id email username");

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        req.user = {
            email: user.email,
            userId: user._id as Types.ObjectId,
            username: user.username,

        };
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authenticated, token failed' });
        return
    }
};

export default protect;
