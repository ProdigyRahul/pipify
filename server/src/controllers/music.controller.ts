import { RequestWithFiles } from "@/middlewares/fileParser";
import { RequestHandler } from "express";
import cloudinary from "@/cloud";
import Music from "@/models/music.model";
import { PopulatedFavouritesList } from "@/@types/music.types";

interface uploadMusicRequest extends RequestWithFiles {
  body: {
    title: string;
    about: string;
    categories: string[];
  };
}

/**
 * @desc    Upload Music Controller
 * @route   POST /api/music/upload
 * @access  Private
 *
 * Handles the upload of a new music track, including its metadata and optional thumbnail.
 * Uploads the music file and thumbnail (if provided) to Cloudinary and saves the track information to the database.
 */
export const uploadMusic: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  const { title, about, categories } = req.body;
  const thumbnail = req.files?.thumbnail;
  const musicFile = req.files?.file;
  const userId = req.user.id;

  // Check if music file is provided
  if (!musicFile) {
    return res.status(400).json({ error: "Music File is missing!" });
  }

  // Upload music file to Cloudinary
  const musicRes = await cloudinary.uploader.upload(musicFile.filepath, {
    resource_type: "video", // Assuming music files are uploaded as videos
  });

  // Create new Music document
  const newMusic = new Music({
    title,
    about,
    categories,
    user: userId,
    file: { url: musicRes.url, publicId: musicRes.publicId }, // Save Cloudinary URL and public ID
  });

  // Handle thumbnail upload if provided
  if (thumbnail) {
    const thumbnailRes = await cloudinary.uploader.upload(thumbnail.filepath, {
      width: 200,
      height: 200,
      crop: "fill",
    });
    newMusic.thumbnail = {
      url: thumbnailRes.secure_url,
      publicId: thumbnailRes.publicId,
    };
  }

  await newMusic.save();

  // Respond with the uploaded music details
  res.status(201).json({
    music: {
      title: newMusic.title,
      about: newMusic.about,
      file: newMusic.file,
      poster: newMusic.thumbnail?.url,
    },
  });
};

/**
 * @desc    Update Music Controller
 * @route   PATCH /api/music/:musicId
 * @access  Private
 *
 * Updates an existing music track's metadata and thumbnail (if provided).
 * Ensures that only the owner of the track can update it.
 */
export const updateMusic: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  const { title, about, categories } = req.body;
  const thumbnail = req.files?.thumbnail;
  const userId = req.user.id;
  const { musicId } = req.params;

  // Find and update the music document
  const music = await Music.findOneAndUpdate(
    { _id: musicId, user: userId }, // Query to find the music by ID and user ownership
    { title, about, categories }, // New data to update
    { new: true } // Options to return the updated document
  );

  // Handle case where music is not found
  if (!music) {
    return res.status(404).json({ error: "Music not found!" });
  }

  // Handle thumbnail update if provided
  if (thumbnail) {
    if (music.thumbnail?.publicId) {
      await cloudinary.uploader.destroy(music.thumbnail.publicId); // Delete previous thumbnail from Cloudinary
    }
    const thumbnailRes = await cloudinary.uploader.upload(thumbnail.filepath, {
      width: 200,
      height: 200,
      crop: "fill",
    });
    music.thumbnail = {
      url: thumbnailRes.secure_url,
      publicId: thumbnailRes.publicId,
    };
    await music.save(); // Save the updated music document
  }

  // Respond with the updated music details
  res.json({
    music: {
      title: music.title,
      about: music.about,
      file: music.file,
      poster: music.thumbnail?.url,
    },
  });
};

export const getLatestUploads: RequestHandler = async (req, res) => {
  const list = await Music.find()
    .sort("-createdAt")
    .limit(10)
    .populate<PopulatedFavouritesList>("user");
  const musics = list.map((item) => {
    return {
      id: item._id,
      title: item.title,
      about: item.about,
      categories: item.categories,
      file: item.file.url,
      thumbnail: item.thumbnail?.url,
      user: {
        name: item.user.name,
        id: item.user._id,
      },
    };
  });
  res.json({
    musics,
  });
};
