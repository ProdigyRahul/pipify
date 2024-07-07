import { categories, categoriesTypes } from "@/utils/musicCategories";
import { Model, model, models, ObjectId, Schema } from "mongoose";

export interface MusicDocument {
  title: string;
  about: string;
  user: ObjectId;
  file: {
    url: string;
    publicId: string;
  };
  thumbnail?: {
    url: string;
    publicId: string;
  };
  likes: ObjectId[];
  categories: categoriesTypes;
}

const MusicSchema = new Schema<MusicDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
        ref: "User",
      },
    ],
    categories: {
      type: String,
      enum: categories,
      required: true,
      default: "Others",
    },
  },
  { timestamps: true }
);
const Music = models.Music || model("Music", MusicSchema);

export default Music as Model<MusicDocument>;
