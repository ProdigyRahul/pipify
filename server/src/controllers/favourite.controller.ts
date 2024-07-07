import Favourite from "@/models/favourite.model";
import Music from "@/models/music.model";
import { RequestHandler } from "express-serve-static-core";
import { isValidObjectId } from "mongoose";

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
