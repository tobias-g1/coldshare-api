import { config } from "dotenv";
import mongoose from "mongoose";

config();

const connectToDatabase = async () => {
  try {
    if (!process.env.DB) {
      console.error("Configuration Error: DB is not configured in .env");
      return;
    }

    await mongoose.connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to database successful");
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
  }
};

const db = mongoose.connection;

db.once("open", () => {
  console.log("Connection Open");
});

db.on("error", (error) => {
  console.error("Connection error:", error);
});

export { connectToDatabase };
