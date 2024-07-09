import { updateHistory } from "@/controllers/history.controller";
import { isAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validator";
import { HistorySchema } from "@/utils/validation";
import { Router } from "express";

const historyRouter = Router();

historyRouter.post("/", isAuth, validate(HistorySchema), updateHistory);

export default historyRouter;
