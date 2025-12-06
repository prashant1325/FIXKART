import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI?.replace("localhost", "127.0.0.1") ||
      "mongodb://127.0.0.1:27017/fixkart";
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Database Connected!!");
  } catch (error: any) {
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
