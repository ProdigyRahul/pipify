import { UserDocument } from "@/models/user.model";

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
