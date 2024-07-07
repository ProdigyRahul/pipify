import { uploadMusic } from "@/controllers/music.controller";
import { isAuth, isVerified } from "@/middlewares/auth.middleware";
import fileParser from "@/middlewares/fileParser";
import { validate } from "@/middlewares/validator";
import { MusicValidation } from "@/utils/validation";
import { Router } from "express";
const musicRouter = Router();

musicRouter.post(
  "/upload-music",
  isAuth,
  isVerified,
  fileParser,
  validate(MusicValidation),
  uploadMusic
);

export default musicRouter;
