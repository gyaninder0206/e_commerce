import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

export const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  ...(process.env.CLIENT_URLS || process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      try {
        const parsedOrigin = new URL(origin);

        if (parsedOrigin.hostname === "localhost" || parsedOrigin.hostname === "127.0.0.1") {
          callback(null, true);
          return;
        }
      } catch {
        // Ignore parse failures and continue to the fallback below.
      }

      if (process.env.NODE_ENV !== "production") {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed."));
    }
  })
);
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
