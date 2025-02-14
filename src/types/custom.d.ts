import { Request } from 'express';
import { Types } from 'mongoose';

declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                userId: Types.ObjectId;
                username: string;
            };
        }
    }
}
