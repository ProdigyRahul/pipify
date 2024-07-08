import { Model, model, models, ObjectId, Schema } from "mongoose";

// Define the structure of a Favourite document
interface FavouriteDocument {
  user: ObjectId; // Reference to the user who favorited items
  items: ObjectId[]; // Array of references to Music items that are favorited
}

// Define favouriteSchema using Schema<FavouriteDocument>
const favouriteSchema = new Schema<FavouriteDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    items: [{ type: Schema.Types.ObjectId, ref: "Music" }], // Array of Music references
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Use existing model or create a new one
const Favourite = models.Favourite || model("Favourite", favouriteSchema);

export default Favourite as Model<FavouriteDocument>; // Export Favourite as a Mongoose Model<FavouriteDocument>
