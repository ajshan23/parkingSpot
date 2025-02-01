import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI!);
        console.log("Connected to mongodb:", connect.connection.host,connect.connection.db?.databaseName);

    } catch (error) {
        console.log("Error while connecting to db", error);
        process.exit(1)
    }
}