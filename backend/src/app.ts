import "express-async-errors";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./commons/routes";
import { errorHandler } from "./commons/middleware/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
