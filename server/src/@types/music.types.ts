import { MusicDocument } from "@/models/music.model";
import { ObjectId } from "mongoose";

export type PopulatedFavouritesList = MusicDocument<{
  _id: ObjectId;
  name: string;
}>;
