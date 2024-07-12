import express from "express";
import "dotenv/config";
import "express-async-errors";
import "./db";
import rateLimit from "express-rate-limit";
import authRouter from "./routers/auth.router";
import musicRouter from "./routers/music.router";
import favouriteRouter from "./routers/favourite.router";
import playlistRouter from "./routers/playlist.router";
import profileRouter from "./routers/profile.router";
import historyRouter from "./routers/history.router";
import "@/utils/schedule";
import { errorHandler } from "./middlewares/error.middleware";
import { logger, morganMiddleware } from "./config/logger";
import helmet from "helmet";
import compression from "compression";
import { validateEnvVariables } from "./utils/variables";

// Validate environment variables
validateEnvVariables();

// Initialize Express server
const server = express();
const PORT = process.env.PORT || 8080;

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: "Too many requests, please try again later.",
    });
  },
});

// Security and performance middlewares
server.use(helmet());
server.use(compression());
server.use(limiter);

// Middleware setup
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(express.static("src/public"));
server.use(morganMiddleware);

// API routes
server.use("/api/v1/auth", authRouter);
server.use("/api/v1/music", musicRouter);
server.use("/api/v1/favourite", favouriteRouter);
server.use("/api/v1/playlist", playlistRouter);
server.use("/api/v1/profile", profileRouter);
server.use("/api/v1/history", historyRouter);

// Health check endpoint
server.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Error handling middleware
server.use(errorHandler);

// Start the server
server.listen(PORT, () => {
  logger.info(`Server is running at http://localhost:${PORT}`);
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (reason: Error, promise: Promise<any>) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Uncaught exception handler
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", error);
});
