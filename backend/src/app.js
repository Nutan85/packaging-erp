import express from "express";
import cors from "cors";

import { healthRoutes } from "./routes/healthRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import salesOrderRoutes from "./routes/salesOrderRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";

import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales-orders", salesOrderRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/suppliers", supplierRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export { app };
