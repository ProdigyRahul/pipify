import { Model, model, models, ObjectId, Schema } from "mongoose";

interface FavouriteDocument {
  user: ObjectId;
  items: ObjectId[];
}

const favouriteSchema = new Schema<FavouriteDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [{ type: Schema.Types.ObjectId, ref: "Music" }],
  },
  { timestamps: true }
);

const Favourite = models.Favourite || model("Favourite", favouriteSchema);

export default Favourite as Model<FavouriteDocument>;
