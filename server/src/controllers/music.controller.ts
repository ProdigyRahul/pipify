import { RequestWithFiles } from "@/middlewares/fileParser";
import { RequestHandler } from "express";
import cloudinary from "@/cloud";
import Music from "@/models/music.model";
interface uploadMusicRequest extends RequestWithFiles {
  body: {
    title: string;
    about: string;
    categories: string[];
  };
}

export const uploadMusic: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  const { title, about, categories } = req.body;
  const thumbnail = req.files?.thumbnail;
  const musicFile = req.files?.file;
  const userId = req.user.id;
  if (!musicFile) {
    return res.status(400).json({ error: "Music File is missing!" });
  }
  const musicRes = await cloudinary.uploader.upload(musicFile.filepath, {
    resource_type: "video",
  });
  const newMusic = new Music({
    title,
    about,
    categories,
    user: userId,
    file: { url: musicRes.url, publicId: musicRes.publicId },
  });
  if (thumbnail) {
    const thumbnailRes = await cloudinary.uploader.upload(thumbnail!.filepath, {
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
  res.status(201).json({
    music: {
      title: newMusic.title,
      about: newMusic.about,
      file: newMusic.file,
      poster: newMusic.thumbnail?.url,
    },
  });
};

export const updateMusic: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  const { title, about, categories } = req.body;
  const thumbnail = req.files?.thumbnail;
  const userId = req.user.id;
  const { musicId } = req.params;

  const music = await Music.findOne(
    { _id: musicId, user: userId },
    { title, about, categories },
    { new: true }
  );
  if (!music) {
    return res.status(404).json({ error: "Music not found!" });
  }

  if (thumbnail) {
    if (music.thumbnail?.publicId) {
      await cloudinary.uploader.destroy(music.thumbnail?.publicId);
    }
    const thumbnailRes = await cloudinary.uploader.upload(thumbnail!.filepath, {
      width: 200,
      height: 200,
      crop: "fill",
    });
    music.thumbnail = {
      url: thumbnailRes.secure_url,
      publicId: thumbnailRes.publicId,
    };
    await music.save();
  }
  res.json({
    music: {
      title: music.title,
      about: music.about,
      file: music.file,
      poster: music.thumbnail?.url,
    },
  });
};
