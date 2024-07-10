import History from "@/models/history.model";
import { UserDocument } from "@/models/user.model";
import { Request } from "express";
import moment from "moment";

/**
 * Generates a random numeric token of specified length.
 * @param length The length of the generated token (default: 6)
 * @returns A randomly generated numeric token.
 */
export const generateToken = (length = 6) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

/**
 * Formats a user document into a simplified profile object.
 * @param user The user document to format.
 * @returns A formatted profile object containing selected user information.
 */
export const formatProfile = (user: UserDocument) => {
  return {
    id: user._id, // User ID
    name: user.name, // User name
    email: user.email, // User email
    verified: user.verified, // User verification status
    avatar: user.avatar?.url, // URL of user avatar if available
    followers: user.followers.length, // Number of followers
    following: user.following.length, // Number of users being followed
  };
};

export const getUsersPreviousHistory = async (
  req: Request
): Promise<string[]> => {
  const [result] = await History.aggregate([
    { $match: { user: req.user.id } },
    { $unwind: "$all" },
    {
      $match: {
        "all.date": {
          // only those histories which are not older than 30 days
          $gte: moment().subtract(30, "days").toDate(),
        },
      },
    },
    { $group: { _id: "$all.music" } },
    {
      $lookup: {
        from: "musics",
        localField: "_id",
        foreignField: "_id",
        as: "musicData",
      },
    },
    { $unwind: "$musicData" },
    { $group: { _id: null, category: { $addToSet: "$musicData.category" } } },
  ]);

  if (result) {
    return result.category;
  }

  return [];
};
