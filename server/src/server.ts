import express from "express";
import "dotenv/config";
import "./db";
import authRouter from "./routers/auth.router";
import musicRouter from "./routers/music.router";
import favouriteRouter from "./routers/favourite.router";

const server = express();
const PORT = process.env.PORT || 8080;

server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(express.static("src/public"));

// API routes
server.use("/api/v1/auth", authRouter);
server.use("/api/v1/music", musicRouter);
server.use("/api/v1/favourite", favouriteRouter);

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:8080`);
});
