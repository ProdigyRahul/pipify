import { PasswordResetToken } from "@/models/resetPassword.model";
import { compare } from "bcrypt";
import { RequestHandler } from "express";
import { Types } from "mongoose";

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
