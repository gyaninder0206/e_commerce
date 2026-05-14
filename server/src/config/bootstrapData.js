import { seedProducts } from "../data/seedProducts.js";
import { Product } from "../models/Product.js";

export const bootstrapProducts = async () => {
  const existingProducts = await Product.countDocuments();

  if (existingProducts > 0) {
    return;
  }

  await Product.insertMany(seedProducts);
  console.log("Bootstrapped sample products into the database");
};
