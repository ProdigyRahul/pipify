import { Model, model, models, ObjectId, Schema } from "mongoose";

// Define the interface for the Playlist document
interface PlaylistDocument {
  title: string; // Title of the playlist
  user: ObjectId; // Reference to the user who created the playlist
  items: ObjectId[]; // Array of music item references in the playlist
  visibility: "public" | "private" | "auto-generated"; // Visibility status of the playlist
}

// Define the schema for the Playlist collection
const playlistSchema = new Schema<PlaylistDocument>(
  {
    title: {
      type: String,
      required: true, // Title is required
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // User reference is required
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Music",
        required: true, // At least one music item is required
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private", "auto-generated"], // Valid visibility options
      required: true,
      default: "public", // Default visibility is public
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Check if the Playlist model already exists; if not, create it
const Playlist = models.Playlist || model("Playlist", playlistSchema);

export default Playlist as Model<PlaylistDocument>; // Export Playlist as a Mongoose Model<PlaylistDocument>
