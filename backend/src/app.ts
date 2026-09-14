import "express-async-errors";
import express from "express";
import cors from "cors";
import routes from "./commons/routes";
import { errorHandler } from "./commons/middleware/error.middleware";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Yoga Studio API is running" });
});

// Must be registered after all routes to catch their errors
app.use(errorHandler);

export default app;
