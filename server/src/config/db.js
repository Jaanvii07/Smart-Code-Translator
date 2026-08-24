import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in your .env file");
    }

    const conn = await mongoose.connect(mongoURI);
    logger.info({ host: conn.connection.host }, "MongoDB connected");
  } catch (error) {
    logger.error({ err: error.message }, "MongoDB connection error");
    process.exit(1);
  }
};

export default connectDB;