import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (_req, res) => {
  res.json({
    message: "Backend API is running.",
    health: "/api/health",
    products: "/api/products",
    orders: "/api/orders"
  });
});

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Server error."
  });
});
