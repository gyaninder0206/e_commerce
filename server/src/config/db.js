import mongoose from "mongoose";

export const connectDb = async () => {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/e_commerce";

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set in the environment.");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};
