import { hash, compare } from "bcrypt";
import { model, Model, ObjectId, Schema } from "mongoose";

export interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  verified: boolean;
  avatar?: {
    url: string;
    publicId: string;
  };
  tokens: string[];
  favourites: ObjectId[];
  followers: ObjectId[];
  following: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: Object,
      url: String,
      publicId: String,
    },
    favourites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Music",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tokens: [String],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Hash the token using bcyrpt
  if (!this.isModified("password")) return next();

  this.password = await hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (userPassword: string) {
  return await compare(userPassword, this.password);
};

export const User: Model<UserDocument> = model<UserDocument>(
  "User",
  userSchema
);
