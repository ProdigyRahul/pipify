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
import { isAuth, isValidResetPassword } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validator";
import {
  CreateUser,
  PasswordResetTokenSchema,
  signInValidation,
  updatePasswordValidation,
} from "@/utils/validation";
import { Router } from "express";
import fileParser from "@/middlewares/fileParser";

const authRouter = Router();

authRouter.post("/signup", validate(CreateUser), signUpController);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/re-verify-email", reVerifyEmail);
authRouter.post("/forget-password", forgetPassword);
authRouter.post(
  "/verify-reset-password",
  validate(PasswordResetTokenSchema),
  isValidResetPassword,
  grantValid
);
authRouter.post(
  "/update-password",
  validate(updatePasswordValidation),
  isValidResetPassword,
  updatePassword
);
authRouter.post("/is-auth", isAuth, sendProfile);
authRouter.post("/sign-in", validate(signInValidation), signIn);
authRouter.post("/update-profile", isAuth, fileParser, updateProfile);
authRouter.post("/sign-out", isAuth, logOut);
export default authRouter;
