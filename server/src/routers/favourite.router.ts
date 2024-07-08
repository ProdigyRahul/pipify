// Import controller functions for favorite operations
import {
  getFavourites,
  toggleFavourite,
} from "@/controllers/favourite.controller";

// Import authentication and verification middleware
import { isAuth, isVerified } from "@/middlewares/auth.middleware";

// Import Express router
import { Router } from "express";

// Initialize Express router for favorite routes
const favouriteRouter = Router();

// Define routes for toggling and retrieving favorites
// Both routes require authentication and verified user status

/**
 * @route POST /api/v1/favourite
 * @description Toggle a favourite item for the authenticated and verified user
 * @access Private
 */
favouriteRouter.post("/", isAuth, isVerified, toggleFavourite);

/**
 * @route GET /api/v1/favourite
 * @description Retrieve all favourite items for the authenticated and verified user
 * @access Private
 */
favouriteRouter.get("/", isAuth, isVerified, getFavourites);

export default favouriteRouter;
