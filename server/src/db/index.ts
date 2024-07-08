import mongoose from "mongoose";
import { MONGO_URI } from "@/utils/variables";

/**
 * Database Connection Setup
 *
 * This script establishes a connection to the MongoDB database using Mongoose.
 * It uses the MONGO_URI imported from the variables file to connect to the specified database.
 */

// Attempt to connect to the MongoDB database
mongoose
  .connect(MONGO_URI)
  .then(() => {
    // Log success message if connection is established
    console.log("Database Successfully Connected");
  })
  .catch((error) => {
    // Log error message if connection fails
    console.log("Database Connection Failed: ", error);
  });

/**
 * Note: In a production environment, consider implementing:
 * - Connection retry logic
 * - Error handling strategies
 * - Logging to external monitoring services
 */
