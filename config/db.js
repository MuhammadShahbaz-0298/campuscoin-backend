import mongoose from "mongoose";
import { env } from "./env.js";

export default async function connectDatabase() {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
}
