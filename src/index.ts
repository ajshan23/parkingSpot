import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/dbConfig";
import { ApiError } from "./utils/apiHandlerHelpers";
import { errorHandler } from "./utils/errorHandler";
dotenv.config({});

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use(morgan('dev'));

app.use(helmet());


app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Secure and Logged World!');
});
app.use((req: Request, res: Response, next: NextFunction) => {
    throw new ApiError(404, "Route not found");
});

// Error-handling middleware
app.use(errorHandler as ErrorRequestHandler);


connectDB().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
})
