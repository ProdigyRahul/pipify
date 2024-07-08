import { hash, compare } from "bcrypt";
import { model, Model, ObjectId, Schema } from "mongoose";

// Define the structure of the User document
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

// Define the user schema with Mongoose
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
        ref: "Music", // Reference to the Music model for favourites
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to other User documents for followers
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to other User documents for following
      },
    ],
    tokens: [String], // Array of tokens for authentication
  },
  { timestamps: true } // Timestamps for createdAt and updatedAt fields
);

// Middleware: Hash password before saving user document
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Hash the password using bcrypt
  this.password = await hash(this.password, 10);
  next();
});

// Method: Compare password for user authentication
userSchema.methods.comparePassword = async function (userPassword: string) {
  return await compare(userPassword, this.password);
};

// Create and export the User model
export const User: Model<UserDocument> = model<UserDocument>(
  "User", // Collection name in MongoDB
  userSchema // Schema definition for User collection
);
