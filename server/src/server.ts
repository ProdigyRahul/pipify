import express from "express";
import "dotenv/config";
import "./db";
import authRouter from "./routers/auth.router";

const server = express();
const PORT = process.env.PORT || 8080;

server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(express.static("src/public"));

// API routes
server.use("/api/v1/auth", authRouter);

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:8080`);
});
