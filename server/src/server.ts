import express from "express";
import "dotenv/config";
import "./db";
import authRouter from "./routers/auth.router";
import musicRouter from "./routers/music.router";
import favouriteRouter from "./routers/favourite.router";
import playlistRouter from "./routers/playlist.router";
import profileRouter from "./routers/profile.router";
import historyRouter from "./routers/history.router";

// Initialize Express server
const server = express();
const PORT = process.env.PORT || 8080;

// Middleware setup
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(express.static("src/public"));

// API routes
server.use("/api/v1/auth", authRouter);
server.use("/api/v1/music", musicRouter);
server.use("/api/v1/favourite", favouriteRouter);
server.use("/api/v1/playlist", playlistRouter);
server.use("/api/v1/profile", profileRouter);
server.use("/api/v1/history", historyRouter);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:8080`);
});
