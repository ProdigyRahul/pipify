import { model, Model, Schema, Types } from "mongoose";
import { hash, compare } from "bcrypt";

// Interface for PasswordResetDocument
interface PasswordResetDocument {
  user: Types.ObjectId;
  token: string;
  createdAt: Date;
}

// Interface for VerifyModel extending Model<PasswordResetDocument>
interface VerifyModel extends Model<PasswordResetDocument> {
  compareToken(
    userId: string | Types.ObjectId,
    token: string
  ): Promise<boolean>;
}

// Define passwordResetSchema using Schema<PasswordResetDocument, VerifyModel>
const passwordResetSchema = new Schema<PasswordResetDocument, VerifyModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Automatically delete documents after 1 hour
  },
});

// Middleware: Hash token before saving
passwordResetSchema.pre("save", async function (next) {
  if (!this.isModified("token")) return next();
  this.token = await hash(this.token, 10);
  next();
});

// Static method: compareToken to compare token with hashed token in database
passwordResetSchema.statics.compareToken = async function (
  userId: string | Types.ObjectId,
  token: string
) {
  if (!userId || !token) {
    console.error("compareToken: userId or token is missing");
    return false;
  }

  const userObjectId =
    typeof userId === "string" ? new Types.ObjectId(userId) : userId;

  const doc = await this.findOne({ user: userObjectId });

  if (!doc) {
    console.error(`compareToken: No document found for userId: ${userId}`);
    return false;
  }

  if (!doc.token) {
    console.error(
      `compareToken: Token is missing in document for userId: ${userId}`
    );
    return false;
  }

  try {
    return await compare(token, doc.token);
  } catch (error) {
    console.error(`compareToken: Error during comparison: ${error}`);
    return false;
  }
};

// Export PasswordResetToken model
export const PasswordResetToken = model<PasswordResetDocument, VerifyModel>(
  "PasswordResetToken", // Collection name in MongoDB
  passwordResetSchema // Schema definition for PasswordResetToken collection
);
