import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");
const clientIndexPath = path.join(clientDistPath, "index.html");
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

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use(express.static(clientDistPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    next();
    return;
  }

  if (!fs.existsSync(clientIndexPath)) {
    res.status(503).json({
      message: "Frontend build not found. Run `npm run build` in the client directory and redeploy `client/dist`."
    });
    return;
  }

  res.sendFile(clientIndexPath);
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Server error."
  });
});
