import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import { seedProducts } from "./data/seedProducts.js";
import { Product } from "./models/Product.js";

dotenv.config();

const seed = async () => {
  try {
    await connectDb();
    await Product.deleteMany();
    await Product.insertMany(seedProducts);
    console.log("Sample products seeded");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seed();
