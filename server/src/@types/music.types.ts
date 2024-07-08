import { Request } from "express";
import { MusicDocument } from "@/models/music.model";
import { ObjectId } from "mongoose";

/**
 * Represents a populated list of favorite music items with additional metadata.
 * It extends the MusicDocument interface to include an additional `_id` and `name` fields.
 */

export type PopulatedFavouritesList = MusicDocument<{
  _id: ObjectId;
  name: string;
}>;

/**
 * Represents the structure of the request body for creating a playlist.
 * It includes the title of the playlist, a list of music IDs, and the visibility status.
 */
export interface CreatePlaylistRequestBody {
  title: string;
  musicId: string;
  visibility: "public" | "private";
}
export interface UpdatePlaylistRequestBody {
  title: string;
  id: string;
  item: string;
  visibility: "public" | "private";
}

/**
 * Extends the Express Request interface to include the CreatePlaylistRequestBody.
 * This is used to type the request object when creating a new playlist.
 */
export interface CreatePlaylistRequest extends Request {
  body: CreatePlaylistRequestBody;
}

export interface UpdatePlaylistRequest extends Request {
  body: UpdatePlaylistRequestBody;
}
