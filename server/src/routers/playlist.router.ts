import {
  createPlaylist,
  getMusics,
  getPlaylists,
  removePlaylist,
  updatePlaylist,
} from "@/controllers/playlist.controller";
import { isAuth, isVerified } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validator";
import { OldPlaylistValidation, PlaylistValidation } from "@/utils/validation";
import { Router } from "express";

// Initialize Express router for playlist routes
const playlistRouter = Router();

/**
 * @route POST /api/v1/playlist/create
 * @description Create a new playlist for the authenticated and verified user
 * @access Private
 */
playlistRouter.post(
  "/create",
  isAuth,
  isVerified,
  validate(PlaylistValidation),
  createPlaylist
);

/**
 * @route PATCH /api/v1/playlist/
 * @description Update a playlist for the authenticated and verified user
 * @access Private
 */
playlistRouter.patch(
  "/",
  isAuth,
  isVerified,
  validate(OldPlaylistValidation),
  updatePlaylist
);

/**
 * @route DELETE /api/v1/playlist/
 * @description Delete a playlist for the authenticated and verified user
 * @access Private
 */
playlistRouter.delete("/", isAuth, isVerified, removePlaylist);
playlistRouter.get("/playlists", isAuth, isVerified, getPlaylists);
playlistRouter.get("/:playlistId", isAuth, getMusics);

export default playlistRouter;
