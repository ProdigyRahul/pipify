import { model, Model, models, ObjectId, Schema } from "mongoose";

export type historyType = {
  music: ObjectId;
  progress: number;
  date: Date;
};
interface HistoryDocument {
  user: ObjectId;
  last: historyType;
  all: historyType[];
}

const historySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    last: {
      music: { type: Schema.Types.ObjectId, ref: "Music" },
      progress: Number,
      date: {
        type: Date,
        required: true,
      },
    },
    all: [
      {
        music: { type: Schema.Types.ObjectId, ref: "Music" },
        progress: Number,
        date: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const History = models.History || model("History", historySchema);

export default History as Model<HistoryDocument>;
