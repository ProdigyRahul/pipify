import { Model, model, models, ObjectId, Schema } from "mongoose";

// Define the interface for the Playlist document
interface AutoPlaylistDocument {
  title: string; // Title of the playlist

  items: ObjectId[]; // Array of music item references in the playlist
}

// Define the schema for the Playlist collection
const playlistSchema = new Schema<AutoPlaylistDocument>(
  {
    title: {
      type: String,
      required: true, // Title is required
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Music",
        required: true, // At least one music item is required
      },
    ],
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Check if the Playlist model already exists; if not, create it
const AutoPlaylist =
  models.AutoPlaylist || model("AutoPlaylist", playlistSchema);

export default AutoPlaylist as Model<AutoPlaylistDocument>; // Export Playlist as a Mongoose Model<PlaylistDocument>
