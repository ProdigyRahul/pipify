// Import necessary types and models
import { paginationQuery } from "@/@types/misc.types";
import { PopulatedFavouritesList } from "@/@types/music.types";
import Favourite from "@/models/favourite.model";
import Music, { MusicDocument } from "@/models/music.model";
import { RequestHandler } from "express-serve-static-core";
import mongoose, { isValidObjectId, ObjectId } from "mongoose";

/**
 * @desc    Toggle Favourite Music Controller
 * @route   POST /api/favourites/toggle
 * @access  Private
 *
 * Toggles a music track's favourite status for the authenticated user.
 * Adds the track to favourites if not present, or removes it if already favourited.
 * Also updates the likes count on the Music document.
 */
export const toggleFavourite: RequestHandler = async (req, res) => {
  const musicId = req.query.musicId as string;

  // Validate musicId
  if (!isValidObjectId(musicId)) {
    return res.status(422).json({ error: "Invalid musicId" });
  }

  // Check if music exists
  const music = await Music.findById(musicId);
  if (!music) {
    return res.status(404).json({ error: "Music not found" });
  }

  let status_music: string;
  let message: string;

  // Check if music is already in favorites
  const alreadyExistMusic = await Favourite.findOne({
    user: req.user.id,
    items: musicId,
  });

  if (alreadyExistMusic) {
    // Remove music from favorites
    await Favourite.updateOne(
      { user: req.user.id },
      {
        $pull: { items: musicId },
      }
    );
    status_music = "removed";
    message = "Removed from favorites";
  } else {
    // Add music to favorites
    const favourite = await Favourite.findOne({ user: req.user.id });
    if (favourite) {
      await Favourite.updateOne(
        { user: req.user.id },
        {
          $addToSet: { items: musicId },
        }
      );
    } else {
      await Favourite.create({
        user: req.user.id,
        items: [musicId],
      });
    }
    status_music = "added";
    message = "Added to favorites";
  }

  // Update likes in Music document
  if (status_music === "added") {
    await Music.findByIdAndUpdate(musicId, {
      $addToSet: { likes: req.user.id },
    });
  }
  if (status_music === "removed") {
    await Music.findByIdAndUpdate(musicId, {
      $pull: { likes: req.user.id },
    });
  }

  return res.json({ status: status_music, message: message });
};

/**
 * @desc    Get User's Favourite Music Controller
 * @route   GET /api/favourites
 * @access  Private
 *
 * Retrieves the list of favourite music tracks for the authenticated user.
 * Returns a formatted list of music objects with essential information.
 */
export const getFavourites: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { limit = "20", skip = "0" } = req.query as paginationQuery;

    // Validate that userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // First, check if the user has any favourites
    const userFavourite = await Favourite.findOne({ user: userId });

    if (!userFavourite) {
      return res.json([]);
    }

    const favourites = await Favourite.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          items: {
            $slice: [
              "$items",
              parseInt(skip),
              { $ifNull: [parseInt(limit), 20] },
            ],
          },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "musics",
          localField: "items",
          foreignField: "_id",
          as: "musicInfo",
        },
      },
      { $unwind: "$musicInfo" },
      {
        $lookup: {
          from: "users",
          localField: "musicInfo.user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 0,
          id: "$musicInfo._id",
          title: "$musicInfo.title",
          about: "$musicInfo.about",
          file: "$musicInfo.file.url",
          thumbnail: "$musicInfo.thumbnail.url",
          user: {
            name: "$userInfo.name",
            id: "$userInfo._id",
          },
        },
      },
    ]);

    res.json(favourites);
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * @desc    Check if a Music Track is a Favourite for the User
 * @route   GET /api/favourites/is-favourite
 * @access  Private
 *
 * Checks whether a specific music track is marked as a favourite by the authenticated user.
 * Returns a boolean indicating the favourite status.
 */
export const isfavourite: RequestHandler = async (req, res) => {
  const musicId = req.query.musicId as string;

  // Validate musicId
  if (!isValidObjectId(musicId)) {
    return res.status(422).json({ error: "Invalid musicId" });
  }

  // Check if the music track is in the user's favourites
  const favourite = await Favourite.findOne({
    user: req.user.id,
    items: musicId,
  });

  // Return the favourite status
  if (favourite) {
    res.json({ isFavourite: true });
  } else {
    res.json({ isFavourite: false });
  }
};
