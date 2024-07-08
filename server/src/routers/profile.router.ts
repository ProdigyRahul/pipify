import {
  getPublicPlaylists,
  getPublicProfile,
  getPublicUploads,
  getUploads,
  updateFollower,
} from "@/controllers/profile.controller";
import { isAuth } from "@/middlewares/auth.middleware";
import { Router } from "express";

const profileRouter = Router();

/**
 * @route POST /api/v1/profile/update-follower/:profileId
 * @description Update the follower count for a user's profile
 * @access Private
 * @requires isAuth - User must be authenticated
 */
profileRouter.post("/update-follower/:profileId", isAuth, updateFollower);

/**
 * @route GET /api/v1/profile/uploads
 * @description Get uploads for the authenticated user
 * @access Private
 * @requires isAuth - User must be authenticated
 */
profileRouter.get("/uploads", isAuth, getUploads);

/**
 * @route GET /api/v1/profile/uploads/:profileId
 * @description Get public uploads for a specific user profile
 * @access Public
 */
profileRouter.get("/uploads/:profileId", getPublicUploads);

/**
 * @route GET /api/v1/profile/public/:profileId
 * @description Get public profile information for a specific user
 * @access Public
 */
profileRouter.get("/public/:profileId", getPublicProfile);

/**
 * @route GET /api/v1/profile/playlist/:profileId
 * @description Get public playlists for a specific user profile
 * @access Public
 */
profileRouter.get("/playlist/:profileId", getPublicPlaylists);

export default profileRouter;
