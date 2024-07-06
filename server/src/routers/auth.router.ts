import {
  reVerifyEmail,
  signUpController,
  verifyEmail,
} from "@/controllers/auth.controller";
import { validate } from "@/middlewares/validator";
import { CreateUser } from "@/utils/validation";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/signup", validate(CreateUser), signUpController);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/re-verify-email", reVerifyEmail);

export default authRouter;
