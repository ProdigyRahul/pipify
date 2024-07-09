// Import controller functions for music operations
import {
  getLatestUploads,
  updateMusic,
  uploadMusic,
} from "@/controllers/music.controller";

// Import middleware for authentication and verification
import { isAuth, isVerified } from "@/middlewares/auth.middleware";

// Import middleware for file parsing and request validation
import fileParser from "@/middlewares/fileParser";
import { validate } from "@/middlewares/validator";

// Import validation schema for music
import { MusicValidation } from "@/utils/validation";

// Import Express router
import { Router } from "express";

// Initialize Express router for music routes
const musicRouter = Router();

/**
 * @route POST /api/v1/music/upload-music
 * @description Upload new music
 * @access Private
 * @requires Authentication, email verification, file parsing, and request validation
 */
musicRouter.post(
  "/upload-music",
  isAuth,
  isVerified,
  fileParser,
  validate(MusicValidation),
  uploadMusic
);

/**
 * @route PATCH /api/v1/music/:musicId
 * @description Update existing music
 * @access Private
 * @requires Authentication, email verification, file parsing, and request validation
 */
musicRouter.patch(
  "/:musicId",
  isAuth,
  isVerified,
  fileParser,
  validate(MusicValidation),
  updateMusic
);
musicRouter.get("/latest", getLatestUploads);

export default musicRouter;
