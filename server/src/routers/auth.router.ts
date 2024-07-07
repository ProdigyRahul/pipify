import {
  forgetPassword,
  grantValid,
  reVerifyEmail,
  signIn,
  signUpController,
  updatePassword,
  verifyEmail,
} from "@/controllers/auth.controller";
import { isValidResetPassword } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validator";
import {
  CreateUser,
  PasswordResetTokenSchema,
  signInValidation,
  updatePasswordValidation,
} from "@/utils/validation";
import { Router } from "express";

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
authRouter.post("/sign-in", validate(signInValidation), signIn);

export default authRouter;
