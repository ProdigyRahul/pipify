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
 * @route   POST /api/v1/playlist/create
 * @desc    Create a new playlist for the authenticated and verified user
 * @access  Private
 */
playlistRouter.post(
  "/create",
  isAuth,
  isVerified,
  validate(PlaylistValidation),
  createPlaylist
);

/**
 * @route   PATCH /api/v1/playlist/
 * @desc    Update a playlist for the authenticated and verified user
 * @access  Private
 */
playlistRouter.patch(
  "/",
  isAuth,
  isVerified,
  validate(OldPlaylistValidation),
  updatePlaylist
);

/**
 * @route   DELETE /api/v1/playlist/
 * @desc    Delete a playlist for the authenticated and verified user
 * @access  Private
 */
playlistRouter.delete("/", isAuth, isVerified, removePlaylist);

/**
 * @route   GET /api/v1/playlist/playlists
 * @desc    Retrieve a list of playlists for the authenticated and verified user
 * @access  Private
 */
playlistRouter.get("/playlists", isAuth, isVerified, getPlaylists);

/**
 * @route   GET /api/v1/playlist/:playlistId
 * @desc    Retrieve a list of music items in a specific playlist for the authenticated user
 * @access  Private
 */
playlistRouter.get("/:playlistId", isAuth, getMusics);

export default playlistRouter;
