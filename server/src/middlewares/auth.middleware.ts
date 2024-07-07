import { PasswordResetToken } from "@/models/resetPassword.model";
import { User } from "@/models/user.model";
import { JWT_SECRET } from "@/utils/variables";
import { RequestHandler } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

export const isValidResetPassword: RequestHandler = async (req, res, next) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ error: "UserId and token are required" });
  }

  try {
    const isValid = await PasswordResetToken.compareToken(userId, token);
    if (!isValid) {
      return res.status(403).json({ error: "Invalid token" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const isAuth: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization?.split("Bearer ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized Access!" });
  }
  const payload = verify(token, JWT_SECRET) as JwtPayload;
  const userId = payload.userId;
  const user = await User.findOne({ _id: userId, tokens: token });
  if (!user) {
    return res.status(403).json({ error: "Unauthorized Access!" });
  }
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
  next();
};
