/**
 * Represents a populated list of favorite music items with additional metadata.
 * It extends the MusicDocument interface to include an additional `_id` and `name` fields.
 */
import { MusicDocument } from "@/models/music.model";
import { ObjectId } from "mongoose";

export type PopulatedFavouritesList = MusicDocument<{
  _id: ObjectId;
  name: string;
}>;
