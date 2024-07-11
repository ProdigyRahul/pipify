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

// Define the schema for the History model
const historySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to the User model
    },
    last: {
      music: { type: Schema.Types.ObjectId, ref: "Music" }, // Reference to the Music model
      progress: Number,
      date: {
        type: Date,
        required: true,
      },
    },
    all: [
      {
        music: { type: Schema.Types.ObjectId, ref: "Music" }, // Reference to the Music model
        progress: Number,
        date: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  { timestamps: true } // Adds timestamps for createdAt and updatedAt
);

// Ensure only one instance of the History model exists
const History = models.History || model("History", historySchema);

export default History as Model<HistoryDocument>;
