// Import necessary modules and models
import { PasswordResetToken } from "@/models/resetPassword.model";
import { User } from "@/models/user.model";
import { JWT_SECRET } from "@/utils/variables";
import { RequestHandler } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

// Middleware to validate password reset token
export const isValidResetPassword: RequestHandler = async (req, res, next) => {
  const { userId, token } = req.body;

  // Check if userId and token are provided
  if (!userId || !token) {
    return res.status(400).json({ error: "UserId and token are required" });
  }

  try {
    // Compare the provided token with the stored token for the user
    const isValid = await PasswordResetToken.compareToken(userId, token);
    if (!isValid) {
      return res.status(403).json({ error: "Invalid token" });
    }
    // If token is valid, proceed to the next middleware
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Middleware to authenticate user
export const isAuth: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;
  // Extract token from Authorization header
  const token = authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized Access!" });
  }

  // Verify the JWT token
  const payload = verify(token, JWT_SECRET) as JwtPayload;
  const userId = payload.userId;

  // Find user with matching id and token
  const user = await User.findOne({ _id: userId, tokens: token });

  if (!user) {
    return res.status(403).json({ error: "Unauthorized Access!" });
  }

  // Attach user information to the request object
  req.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    avatar: user.avatar?.url,
    followers: user.followers.length,
    following: user.following.length,
  };
  req.token = token;

  // Proceed to the next middleware
  next();
};

// Middleware to check if user is verified
export const isVerified: RequestHandler = (req, res, next) => {
  if (!req.user.verified) {
    return res
      .status(403)
      .json({ error: "Unauthorized Access! Not Verified User" });
  }
  // If user is verified, proceed to the next middleware
  next();
};
