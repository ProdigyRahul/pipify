import express from "express";
import "dotenv/config";
import "express-async-errors";
import "./db";
import authRouter from "./routers/auth.router";
import musicRouter from "./routers/music.router";
import favouriteRouter from "./routers/favourite.router";
import playlistRouter from "./routers/playlist.router";
import profileRouter from "./routers/profile.router";
import historyRouter from "./routers/history.router";
import "@/utils/schedule";
import { errorHandler } from "./middlewares/error.middleware";
import { logger, morganMiddleware } from "./config/logger";
// Initialize Express server
const server = express();
const PORT = process.env.PORT || 8080;

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
