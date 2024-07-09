import {
  getHistories,
  getRecentlyPlayed,
  removeHistory,
  updateHistory,
} from "@/controllers/history.controller";
import { isAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validator";
import { HistorySchema } from "@/utils/validation";
import { Router } from "express";

const historyRouter = Router();

historyRouter.post("/", isAuth, validate(HistorySchema), updateHistory);
historyRouter.delete("/", isAuth, removeHistory);
historyRouter.get("/", isAuth, getHistories);
historyRouter.get("/recently-played", isAuth, getRecentlyPlayed);

export default historyRouter;
