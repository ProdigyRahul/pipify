import {
  getFavourites,
  toggleFavourite,
} from "@/controllers/favourite.controller";
import { isAuth, isVerified } from "@/middlewares/auth.middleware";
import { Router } from "express";

const favouriteRouter = Router();

favouriteRouter.post("/", isAuth, isVerified, toggleFavourite);
favouriteRouter.get("/", isAuth, isVerified, getFavourites);

export default favouriteRouter;
