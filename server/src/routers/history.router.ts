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

// Initialize Express router for history routes
const historyRouter = Router();

/**
 * @route   POST /api/v1/history
 * @desc    Update or create a history record
 * @access  Private
 * @requires isAuth - User must be authenticated
 * @requires validate(HistorySchema) - Middleware to validate the request body
 */
historyRouter.post("/", isAuth, validate(HistorySchema), updateHistory);

/**
 * @route   DELETE /api/v1/history
 * @desc    Remove a history record
 * @access  Private
 * @requires isAuth - User must be authenticated
 */
historyRouter.delete("/", isAuth, removeHistory);

/**
 * @route   GET /api/v1/history
 * @desc    Get history records
 * @access  Private
 * @requires isAuth - User must be authenticated
 */
historyRouter.get("/", isAuth, getHistories);

/**
 * @route   GET /api/v1/history/recently-played
 * @desc    Get recently played history records
 * @access  Private
 * @requires isAuth - User must be authenticated
 */
historyRouter.get("/recently-played", isAuth, getRecentlyPlayed);

export default historyRouter;
