import {
  forgetPassword,
  grantValid,
  reVerifyEmail,
  signUpController,
  updatePassword,
  verifyEmail,
} from "@/controllers/auth.controller";
import { isValidResetPassword } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validator";
import { CreateUser, PasswordResetTokenSchema } from "@/utils/validation";
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
  validate(PasswordResetTokenSchema),
  isValidResetPassword,
  updatePassword
);

export default authRouter;
