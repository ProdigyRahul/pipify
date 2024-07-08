import { categories, categoriesTypes } from "@/utils/musicCategories";
import { Model, model, models, ObjectId, Schema } from "mongoose";

// Define the structure of a Music document
export interface MusicDocument<T = ObjectId> {
  _id: ObjectId;
  title: string;
  about: string;
  user: T; // Reference to the user who uploaded the music
  file: {
    url: string;
    publicId: string;
  };
  thumbnail?: {
    url: string;
    publicId: string;
  };
  likes: ObjectId[]; // Array of user IDs who liked the music
  categories: categoriesTypes; // Type of music categories
  createdAt: Date; // Date
}

// Define MusicSchema using Schema<MusicDocument>
const MusicSchema = new Schema<MusicDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    file: {
      type: Object,
      url: String,
      publicId: String,
      required: true,
    },
    thumbnail: {
      type: Object,
      url: String,
      publicId: String,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to the User model for likes
      },
    ],
    categories: {
      type: String,
      enum: categories, // Ensure categories match predefined types
      required: true,
      default: "Others", // Default category if not specified
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Use existing model or create a new one
const Music = models.Music || model("Music", MusicSchema);

export default Music as Model<MusicDocument>; // Export Music as a Mongoose Model<MusicDocument>
