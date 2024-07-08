// Import controller functions for authentication operations
import {
  forgetPassword,
  grantValid,
  logOut,
  reVerifyEmail,
  sendProfile,
  signIn,
  signUpController,
  updatePassword,
  updateProfile,
  verifyEmail,
} from "@/controllers/auth.controller";

// Import middleware for authentication and request validation
import { isAuth, isValidResetPassword } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validator";
import {
  CreateUser,
  PasswordResetTokenSchema,
  signInValidation,
  updatePasswordValidation,
} from "@/utils/validation";

// Import Express router and file parsing middleware
import { Router } from "express";
import fileParser from "@/middlewares/fileParser";

// Initialize Express router for authentication routes
const authRouter = Router();

// Define authentication routes with their respective middlewares and controllers

/**
 * @route POST /api/v1/auth/signup
 * @description Register a new user with validation middleware
 * @access Public
 */
authRouter.post("/signup", validate(CreateUser), signUpController);

/**
 * @route POST /api/v1/auth/verify-email
 * @description Verify a user's email
 * @access Public
 */
authRouter.post("/verify-email", verifyEmail);

/**
 * @route POST /api/v1/auth/re-verify-email
 * @description Re-send email verification
 * @access Public
 */
authRouter.post("/re-verify-email", reVerifyEmail);

/**
 * @route POST /api/v1/auth/forget-password
 * @description Initiate a password reset
 * @access Public
 */
authRouter.post("/forget-password", forgetPassword);

/**
 * @route POST /api/v1/auth/verify-reset-password
 * @description Verify password reset token with validation middleware
 * @access Public
 */
authRouter.post(
  "/verify-reset-password",
  validate(PasswordResetTokenSchema),
  isValidResetPassword,
  grantValid
);

/**
 * @route POST /api/v1/auth/update-password
 * @description Update user password with validation middleware
 * @access Public
 */
authRouter.post(
  "/update-password",
  validate(updatePasswordValidation),
  isValidResetPassword,
  updatePassword
);

/**
 * @route POST /api/v1/auth/is-auth
 * @description Check if user is authenticated and send profile information
 * @access Private
 */
authRouter.post("/is-auth", isAuth, sendProfile);

/**
 * @route POST /api/v1/auth/sign-in
 * @description Authenticate user and initiate session with validation middleware
 * @access Public
 */
authRouter.post("/sign-in", validate(signInValidation), signIn);

/**
 * @route POST /api/v1/auth/update-profile
 * @description Update user profile with authentication and file parsing middleware
 * @access Private
 */
authRouter.post("/update-profile", isAuth, fileParser, updateProfile);

/**
 * @route POST /api/v1/auth/sign-out
 * @description Sign out user and terminate session
 * @access Private
 */
authRouter.post("/sign-out", isAuth, logOut);

export default authRouter;
