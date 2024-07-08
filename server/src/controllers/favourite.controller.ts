// Import necessary types and models
import { PopulatedFavouritesList } from "@/@types/music.types";
import Favourite from "@/models/favourite.model";
import Music, { MusicDocument } from "@/models/music.model";
import { RequestHandler } from "express-serve-static-core";
import { isValidObjectId, ObjectId } from "mongoose";

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
  const userId = req.user.id;

  // Find user's favourites and populate music details
  const favourites = await Favourite.findOne({ user: userId }).populate<{
    items: PopulatedFavouritesList[];
  }>({
    path: "items",
    populate: {
      path: "user",
    },
  });

  // Handle case where no favourites found
  if (!favourites) {
    return res.status(404).json({ error: "Favourites not found", musics: [] });
  }

  // Format music data for response
  const musics = favourites.items.map((item) => ({
    id: item._id,
    title: item.title,
    categories: item.categories,
    file: item.file.url,
    thumbnail: item.thumbnail?.url,
    user: {
      name: item.user.name,
      id: item.user._id,
    },
  }));

  res.json({ musics });
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
