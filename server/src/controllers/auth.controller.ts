import { NewUser, VerifyEmail } from "@/@types/user.types";
import { PasswordResetToken } from "@/models/resetPassword.model";
import { User } from "@/models/user.model";
import { VerificationToken } from "@/models/verification.model";
import { generateToken } from "@/utils/helper";
import {
  ResetPasswordSucessMail,
  sendForgetPasswordLink,
  sendVerificationMail,
} from "@/utils/mail";
import { RequestHandler } from "express";
import { Types } from "mongoose";
import crypto from "crypto";
import { PASSWORD_RESET_LINK } from "@/utils/variables";
import { compare } from "bcrypt";

/**
 * Controller for user sign-up process.
 * Creates a new user, generates a verification token, and sends a verification email.
 */
export const signUpController: RequestHandler = async (req: NewUser, res) => {
  const { email, password, name } = req.body;
  const user = await User.create({ email, password, name });

  const token = generateToken();

  sendVerificationMail(token, {
    name,
    email,
    userId: user._id.toString(),
  });

  res.status(201).json({ user: { id: user._id, name, email } });
};

/**
 * Controller for email verification process.
 * Validates the token, updates user's verification status, and removes the used token.
 */
export const verifyEmail: RequestHandler = async (req: VerifyEmail, res) => {
  const { token, userId } = req.body;

  let userObjectId: Types.ObjectId;
  try {
    userObjectId = new Types.ObjectId(userId);
  } catch (error) {
    return res.status(400).json({ error: "Invalid userId format" });
  }

  const matched = await VerificationToken.compareToken(userObjectId, token);
  if (!matched) {
    return res.status(403).json({ error: "Invalid token" });
  }

  await User.findByIdAndUpdate(userObjectId, { verified: true });
  await VerificationToken.findOneAndDelete({ user: userObjectId });

  res.status(200).json({ message: "Email verified successfully" });
};

/**
 * Controller for re-sending verification email.
 * Removes the existing token, sends a new verification email, and creates a new token in the database.
 */

/**
 * Controller for re-sending verification email.
 * Removes the existing token, generates a new one, sends a new verification email, and creates a new token in the database.
 */
export const reVerifyEmail: RequestHandler = async (req, res) => {
  const { userId } = req.body;
  let userObjectId: Types.ObjectId;

  try {
    userObjectId = new Types.ObjectId(userId);
  } catch (error) {
    return res.status(400).json({ error: "Invalid userId format" });
  }

  const user = await User.findById(userObjectId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Remove existing token
  await VerificationToken.findOneAndDelete({ user: userObjectId });

  // Generate a new token
  const newToken = generateToken();

  // Send new verification email with the new token
  await sendVerificationMail(newToken, {
    name: user.name,
    email: user.email,
    userId: userObjectId.toString(),
  });

  res.status(200).json({ message: "Verification email sent again" });
};

export const forgetPassword: RequestHandler = async (req, res) => {
  // Implement forget password logic here
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  // Remove existing token
  await PasswordResetToken.findOneAndDelete({ user: user._id });
  // Generate a new token
  const token = crypto.randomBytes(42).toString("hex");
  await PasswordResetToken.create({
    user: user._id,
    token,
  });
  // Send password reset email with the token
  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  await sendForgetPasswordLink({ email: user.email, link: resetLink });

  res.status(200).json({ message: "Password reset email sent" });
};

export const grantValid: RequestHandler = (req, res) => {
  res.json({ valid: true });
};

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

export const updatePassword: RequestHandler = async (req, res) => {
  const { password, userId } = req.body;

  if (!password || !userId) {
    return res.status(400).json({ error: "Password and userId are required" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(403).json({ error: "Unauthorized Access!" });
  }

  if (!user.password) {
    user.password = password;
    await user.save();
    await PasswordResetToken.findOneAndDelete({ user: user._id });
    ResetPasswordSucessMail(user.name, user.email);
    return res.status(200).json({ message: "Password set successfully" });
  }

  try {
    const matched = await compare(password, user.password);

    if (matched) {
      return res
        .status(422)
        .json({ error: "Password must be different than previous password!" });
    }

    user.password = password;
    await user.save();
    await PasswordResetToken.findOneAndDelete({ user: user._id });
    ResetPasswordSucessMail(user.name, user.email);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the password" });
  }
};
