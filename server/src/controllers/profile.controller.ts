import { categories } from "./../utils/musicCategories";
import { paginationQuery } from "@/@types/misc.types";
import Music, { MusicDocument } from "@/models/music.model";
import Playlist from "@/models/playlist.model";
import { User } from "@/models/user.model";
import { RequestHandler } from "express";
import { isValidObjectId, ObjectId } from "mongoose";

/**
 * @desc    Update Follower Status Controller
 * @route   POST /api/v1/profile/update-follower/:profileId
 * @access  Private
 *
 * Updates the follower status for a user. Adds or removes the follower based on current status.
 * Ensures the profile ID is valid and the user exists.
 */
export const updateFollower: RequestHandler = async (req, res) => {
  const { profileId } = req.params;
  let status: "added" | "removed";
  if (!isValidObjectId(profileId)) {
    return res.status(422).json({ error: "Unauthorized Access!" });
  }
  const user = await User.findById(profileId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const alreadyFollower = await User.findOne({
    _id: profileId,
    followers: req.user.id,
  });
  if (alreadyFollower) {
    await User.updateOne(
      {
        _id: profileId,
      },
      {
        $pull: { followers: req.user.id },
      }
    );
    status = "removed";
  } else {
    // Follow the user
    await User.updateOne(
      {
        _id: profileId,
      },
      {
        $addToSet: { followers: req.user.id },
      }
    );
    status = "added";
  }
  if (status === "added") {
    // Update the following list(add)
    await User.updateOne(
      {
        _id: req.user.id,
      },
      {
        $addToSet: { following: profileId },
      }
    );
  }
  if (status === "removed") {
    // remove from the following list(remove)
    await User.updateOne(
      {
        _id: req.user.id,
      },
      {
        $pull: { following: profileId },
      }
    );
  }
  res.json({ status });
};

/**
 * @desc    Get User Uploads Controller
 * @route   GET /api/v1/profile/uploads
 * @access  Private
 *
 * Retrieves a list of music uploads for the authenticated user.
 * Supports pagination through 'skip' and 'limit' query parameters.
 */
export const getUploads: RequestHandler = async (req, res) => {
  const { skip = "0", limit = "10" } = req.query as paginationQuery;
  const data = await Music.find({
    user: req.user.id,
  })
    .skip(parseInt(skip) * parseInt(limit))
    .limit(parseInt(limit))
    .sort("-createdAt");
  const musics = data.map((item) => {
    return {
      id: item._id,
      title: item.title,
      about: item.about,
      categories: item.categories,
      file: item.file.url,
      thumbnail: item.thumbnail?.url,
      date: item.createdAt,
      user: {
        name: req.user.name,
        id: req.user.id,
      },
    };
  });
  res.json({ musics });
};

/**
 * @desc    Get Public User Uploads Controller
 * @route   GET /api/v1/profile/uploads/:profileId
 * @access  Public
 *
 * Retrieves a list of public music uploads for a specific user.
 * Supports pagination through 'skip' and 'limit' query parameters.
 * Ensures the profile ID is valid.
 */
export const getPublicUploads: RequestHandler = async (req, res) => {
  const { skip = "0", limit = "10" } = req.query as paginationQuery;
  const { profileId } = req.params;
  if (!isValidObjectId(profileId)) {
    return res.status(422).json({ error: "Unauthorized Access!" });
  }
  const data = await Music.find({
    user: profileId,
  })

    .skip(parseInt(skip) * parseInt(limit))
    .limit(parseInt(limit))
    .sort("-createdAt")
    .populate<MusicDocument<{ name: string; _id: ObjectId }>>("user");
  const musics = data.map((item) => {
    return {
      id: item._id,
      title: item.title,
      about: item.about,
      categories: item.categories,
      file: item.file.url,
      thumbnail: item.thumbnail?.url,
      date: item.createdAt,
      user: {
        name: item.user.name,
        id: item.user._id,
      },
    };
  });
  res.json({ musics });
};

/**
 * @desc    Get Public User Profile Controller
 * @route   GET /api/v1/profile/public/:profileId
 * @access  Public
 *
 * Retrieves the public profile of a specific user.
 * Ensures the profile ID is valid and the user exists.
 */
export const getPublicProfile: RequestHandler = async (req, res) => {
  const { profileId } = req.params;
  if (!isValidObjectId(profileId)) {
    return res.status(422).json({ error: "Unauthorized Access!" });
  }
  const user = await User.findById(profileId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({
    profile: {
      id: user._id,
      name: user.name,
      followers: user.followers.length,
      avatar: user.avatar?.url,
    },
  });
};

/**
 * @desc    Get Public User Playlists Controller
 * @route   GET /api/v1/profile/playlist/:profileId
 * @access  Public
 *
 * Retrieves a list of public playlists for a specific user.
 * Supports pagination through 'skip' and 'limit' query parameters.
 * Ensures the profile ID is valid.
 */
export const getPublicPlaylists: RequestHandler = async (req, res) => {
  const { profileId } = req.params;
  const { skip = "0", limit = "10" } = req.query as paginationQuery;

  if (!isValidObjectId(profileId)) {
    return res.status(422).json({ error: "Unauthorized Access!" });
  }
  const playlists = await Playlist.find({
    user: profileId,
    visibility: "public",
  })
    .skip(parseInt(limit) * parseInt(skip))
    .limit(parseInt(limit))
    .sort("-createdAt");

  res.json({
    playlists: playlists.map((item) => {
      return {
        id: item._id,
        title: item.title,
        itemsCount: item.items.length,
        visibility: item.visibility,
      };
    }),
  });
};

export const getRecommended: RequestHandler = async (req, res) => {
  const user = req.user;
  if (user) {
    // send by profile
  }
  // Otherwise send default musics
  const musics = await Music.aggregate([
    { $match: { _id: { $exists: true } } },
    {
      $sort: {
        "likes.count": -1,
      },
    },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: 0,
        id: "$_id",
        title: "$title",
        categories: "$categories",
        about: "$about",
        file: "$file.url",
        thumbnail: "$thumbnail.url",
        user: {
          name: "$user.name",
          id: "$user._id",
        },
      },
    },
  ]);
  res.json({ musics });
};
