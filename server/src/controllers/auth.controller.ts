// Import types and models
import { NewUser, VerifyEmail } from "@/@types/user.types";
import { PasswordResetToken } from "@/models/resetPassword.model";
import { User } from "@/models/user.model";
import { VerificationToken } from "@/models/verification.model";

// Import helper functions and utilities
import { formatProfile, generateToken } from "@/utils/helper";
import {
  ResetPasswordSucessMail,
  sendForgetPasswordLink,
  sendVerificationMail,
} from "@/utils/mail";
import { JWT_SECRET, PASSWORD_RESET_LINK } from "@/utils/variables";

// Import middleware and dependencies
import { RequestHandler } from "express";
import { Types } from "mongoose";
import crypto from "crypto";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { RequestWithFiles } from "@/middlewares/fileParser";
import cloudinary from "@/cloud";

/**
 * @desc    User Sign-up Controller
 * @route   POST /api/auth/signup
 * @access  Public
 *
 * Creates a new user account, generates a verification token, and sends a verification email.
 */
export const signUpController: RequestHandler = async (req: NewUser, res) => {
  const { email, password, name } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: "Email already exists" });
  }

  const user = await User.create({ email, password, name });

  const token = generateToken();

  await sendVerificationMail(token, {
    name,
    email,
    userId: user._id.toString(),
  });

  res.status(201).json({ user: { id: user._id, name, email } });
};

/**
 * @desc    Email Verification Controller
 * @route   POST /api/auth/verify-email
 * @access  Public
 *
 * Validates the email verification token and updates the user's verification status.
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
 * @desc    Re-send Verification Email Controller
 * @route   POST /api/auth/re-verify-email
 * @access  Public
 *
 * Generates a new verification token and sends a fresh verification email to the user.
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
  if (user.verified) {
    return res.status(400).json({ error: "Email already verified" });
  }

  await VerificationToken.findOneAndDelete({ user: userObjectId });

  const newToken = generateToken();

  await sendVerificationMail(newToken, {
    name: user.name,
    email: user.email,
    userId: userObjectId.toString(),
  });

  res.status(200).json({ message: "Verification email sent again" });
};

/**
 * @desc    Forget Password Controller
 * @route   POST /api/auth/forget-password
 * @access  Public
 *
 * Generates a password reset token and sends a reset link to the user's email.
 */
export const forgetPassword: RequestHandler = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  await PasswordResetToken.findOneAndDelete({ user: user._id });

  const token = crypto.randomBytes(42).toString("hex");
  await PasswordResetToken.create({
    user: user._id,
    token,
  });

  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  await sendForgetPasswordLink({ email: user.email, link: resetLink });

  res.status(200).json({ message: "Password reset email sent" });
};

/**
 * @desc    Grant Valid Token Controller
 * @route   POST /api/auth/grant-valid
 * @access  Private
 *
 * Confirms the validity of a token, used in the password reset process.
 */
export const grantValid: RequestHandler = (req, res) => {
  res.json({ valid: true });
};

/**
 * @desc    Validate Reset Password Token Middleware
 * @access  Private
 *
 * Middleware to validate the password reset token before allowing password update.
 */
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

/**
 * @desc    Update Password Controller
 * @route   POST /api/auth/update-password
 * @access  Private
 *
 * Updates the user's password after validating the reset token.
 */
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

    PasswordResetToken.findOneAndDelete({ user: user._id });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the password" });
  }
};

/**
 * @desc    User Sign-in Controller
 * @route   POST /api/auth/signin
 * @access  Public
 *
 * Authenticates the user and returns a JWT token along with user profile information.
 */
export const signIn: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.verified) {
    return res
      .status(401)
      .json({ error: "Invalid email or unverified account" });
  }
  const isCorrectPassword = await compare(password, user.password);
  if (!isCorrectPassword) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "30d",
  });
  user.tokens.push(token);
  await user.save();
  res.json({
    profile: {
      id: user._id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      avatar: user.avatar?.url,
      followers: user.followers.length,
      followings: user.following.length,
    },
    token,
    message: "Login successful",
  });
};

/**
 * @desc    Update User Profile Controller
 * @route   POST /api/auth/update-profile
 * @access  Private
 *
 * Updates the user's profile information, including name and avatar.
 */
export const updateProfile: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  const { name } = req.body;
  const avatar = req.files?.avatar;
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new Error(
      "Something went wrong! User is not logged in. Please login again and try again later"
    );
  }
  if (typeof name !== "string") {
    return res.status(422).json({ error: "Name must be a string" });
  }
  if (name.trim().length < 3) {
    return res.status(422).json({ error: "Invalid Name" });
  }
  user.name = name;
  if (avatar) {
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      avatar.filepath,
      {
        transformation: {
          width: 300,
          height: 300,
          crop: "thumb",
          gravity: "face",
        },
      }
    );
    user.avatar = { url: secure_url, publicId: public_id };
  }
  await user.save();
  res.json({
    profile: formatProfile(user),
  });
};

/**
 * @desc    Send User Profile Controller
 * @route   GET /api/auth/profile
 * @access  Private
 *
 * Retrieves and sends the authenticated user's profile information.
 */
export const sendProfile: RequestHandler = async (req, res) => {
  res.json({
    profile: req.user,
  });
};

/**
 * @desc    User Logout Controller
 * @route   POST /api/auth/logout
 * @access  Private
 *
 * Logs out the user by removing their authentication token(s).
 */
export const logOut: RequestHandler = async (req, res) => {
  const { logOutAll } = req.query;
  const token = req.token;
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new Error(
      "Something went wrong! User is not logged in. Please login again and try again later"
    );
  }
  if (!token) {
    throw new Error("Invalid token. Please login again and try again later");
  }
  if (logOutAll === "true") {
    user.tokens = [];
  } else {
    user.tokens = user.tokens.filter((t) => t !== req.token);
  }
  await user.save();
  res.status(200).json({ message: "Logged out successfully" });
};
