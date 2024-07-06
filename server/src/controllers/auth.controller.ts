import { NewUser, VerifyEmail } from "@/@types/user.types";
import { User } from "@/models/user.model";
import { VerificationToken } from "@/models/verification.model";
import { generateToken } from "@/utils/helper";
import { sendVerificationMail } from "@/utils/mail";
import { RequestHandler } from "express";
import { Types } from "mongoose";

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
