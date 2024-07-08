import { PopulatedFavouritesList } from "@/@types/music.types";
import Favourite from "@/models/favourite.model";
import Music, { MusicDocument } from "@/models/music.model";
import { RequestHandler } from "express-serve-static-core";
import { isValidObjectId, ObjectId } from "mongoose";

export const toggleFavourite: RequestHandler = async (req, res) => {
  const musicId = req.query.musicId as string;
  if (!isValidObjectId(musicId)) {
    return res.status(422).json({ error: "Invalid musicId" });
  }

  // check if music exists
  const music = await Music.findById(musicId);
  if (!music) {
    return res.status(404).json({ error: "Music not found" });
  }

  let status_music: string;
  let message: string;

  //   Music is already in favorites
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

export const getFavourites: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const favourites = await Favourite.findOne({ user: userId }).populate<{
    items: PopulatedFavouritesList[];
  }>({
    path: "items",
    populate: {
      path: "user",
    },
  });
  if (!favourites) {
    return res.status(404).json({ error: "Favourites not found", musics: [] });
  }
  const musics = favourites?.items.map((item) => {
    return {
      id: item._id,
      title: item.title,
      categories: item.categories,
      file: item.file.url,
      thumbnail: item.thumbnail?.url,
      user: {
        name: item.user.name,
        id: item.user._id,
      },
    };
  });
  res.json({ musics });
};
