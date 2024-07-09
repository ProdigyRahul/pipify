import { updateHistory } from "@/controllers/history.controller";
import { validate } from "@/middlewares/validator";
import { HistorySchema } from "@/utils/validation";
import { Router } from "express";

const historyRouter = Router();

historyRouter.post("/", validate(HistorySchema), updateHistory);

export default historyRouter;
