import {
  CreatePlaylistRequest,
  PopulatedFavouritesList,
  UpdatePlaylistRequest,
} from "@/@types/music.types";
import Music from "@/models/music.model";
import Playlist from "@/models/playlist.model";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

/**
 * @desc    Create Playlist Controller
 * @route   POST /api/v1/playlist/create
 * @access  Private
 *
 * Creates a new playlist for the authenticated user.
 * If a music ID is provided, validates the music and adds it to the playlist.
 */
export const createPlaylist: RequestHandler = async (
  req: CreatePlaylistRequest,
  res
) => {
  const { title, musicId, visibility } = req.body;
  const userId = req.user.id;

  if (musicId) {
    const music = await Music.findById(musicId);
    if (!music) {
      return res.status(404).json({ error: "Music not found" });
    }
  }
  const playlist = new Playlist({
    title,
    user: userId,
    visibility,
  });
  if (musicId) {
    playlist.items = [musicId as any];
  }
  await playlist.save();
  //   Res with status 201 only
  res.status(201).json({
    playlist: {
      id: playlist._id,
      title: playlist.title,
      visibility: playlist.visibility,
    },
  });
};

/**
 * @desc    Update Playlist Controller
 * @route   PATCH /api/v1/playlist/update
 * @access  Private
 *
 * Updates the title and visibility of an existing playlist.
 * If a music item is provided, validates the music and adds it to the playlist.
 */
export const updatePlaylist: RequestHandler = async (
  req: UpdatePlaylistRequest,
  res
) => {
  const { id, item, title, visibility } = req.body;

  const playlist = await Playlist.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { title, visibility },
    { new: true }
  );

  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found" });
  }

  if (item) {
    const music = await Music.findById(item);
    if (!music) {
      return res.status(404).json({ error: "Music not found" });
    }
    // playlist.items.push(music._id);
    // await playlist.save();
    await Playlist.findByIdAndUpdate(playlist._id, {
      $addToSet: { items: item },
    });
  }

  res.json({
    playlist: {
      id: playlist._id,
      title: playlist.title,
      visibility: playlist.visibility,
    },
  });
};

/**
 * @desc    Remove Playlist Controller
 * @route   DELETE /api/v1/playlist/remove
 * @access  Private
 *
 * Removes a playlist or a music item from a playlist based on the query parameters.
 * If 'all' is set to 'yes', removes the entire playlist.
 * If 'musicId' is provided, removes the music item from the playlist.
 */

export const removePlaylist: RequestHandler = async (req, res) => {
  const { playlistId, musicId, all } = req.query;

  if (!isValidObjectId(playlistId)) {
    return res.status(422).json({ error: "Invalid Playlist" });
  }

  if (all === "yes") {
    const playlist = await Playlist.findOneAndDelete({
      _id: playlistId,
      user: req.user.id,
    });
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }
  }
  if (musicId) {
    if (!isValidObjectId(musicId)) {
      return res.status(422).json({ error: "Invalid Music" });
    }
    const playlist = await Playlist.findOneAndUpdate(
      { _id: playlistId, user: req.user.id },
      {
        $pull: { items: musicId },
      },
      { new: true }
    );

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }
  }

  res.status(200).json({ success: true });
};

/**
 * @desc    Get Playlists Controller
 * @route   GET /api/v1/playlist
 * @access  Private
 *
 * Retrieves a list of playlists for the authenticated user.
 * Supports pagination through 'skip' and 'limit' query parameters.
 */
export const getPlaylists: RequestHandler = async (req, res) => {
  const { skip = "0", limit = "10" } = req.query as {
    skip: string;
    limit: string;
  };

  const playlist = await Playlist.find({
    user: req.user.id,
    visibility: { $ne: "auto-generated" },
  })
    .skip(parseInt(skip) * parseInt(limit))
    .limit(parseInt(limit))
    .sort("-createdAt");

  const newPlaylist = playlist.map((item) => {
    return {
      id: item._id,
      title: item.title,
      itemsCount: item.items.length,
      visibility: item.visibility,
    };
  });
  res.json({ playlists: newPlaylist });
};

/**
 * @desc    Get Musics Controller
 * @route   GET /api/v1/playlist/:playlistId
 * @access  Private
 *
 * Retrieves a list of music items in a specific playlist for the authenticated user.
 * Populates the user details of each music item.
 */
export const getMusics: RequestHandler = async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    return res.status(422).json({ error: "Invalid playlistId" });
  }
  const playlist = await Playlist.findOne({
    user: req.user.id,
    _id: playlistId,
  }).populate<{ items: PopulatedFavouritesList[] }>({
    path: "items",
    populate: {
      path: "user",
      select: "name",
    },
  });
  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found" });
  }

  const musics = playlist.items.map((item) => {
    return {
      id: item._id,
      title: item.title,
      categories: item.categories,
      file: item.file.url,
      thumbnail: item.thumbnail?.url,
      user: { name: item.user.name, id: item.user._id },
    };
  });
  res.json({
    list: {
      id: playlist._id,
      title: playlist.title,
      musics,
    },
  });
};
