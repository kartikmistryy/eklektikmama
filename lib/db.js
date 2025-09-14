import mongoose from "mongoose";

let isConnected = false; // global flag

export const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "myapp", // change if you want a custom DB name
    });

    isConnected = true;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
};
