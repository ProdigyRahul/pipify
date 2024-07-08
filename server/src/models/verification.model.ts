import { model, Model, Schema, Types } from "mongoose";
import { hash, compare } from "bcrypt";

// Interface for VerifyDocument
interface VerifyDocument {
  user: Types.ObjectId;
  token: string;
  createdAt: Date;
}

// Interface for VerifyModel extending Model<VerifyDocument>
interface VerifyModel extends Model<VerifyDocument> {
  compareToken(
    userId: string | Types.ObjectId,
    token: string
  ): Promise<boolean>;
}

// Define verifyToken schema using Schema<VerifyDocument, VerifyModel>
const verifyToken = new Schema<VerifyDocument, VerifyModel>({
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
verifyToken.pre("save", async function (next) {
  if (!this.isModified("token")) return next();
  this.token = await hash(this.token, 10);
  next();
});

// Static method: compareToken to compare token with hashed token in database
verifyToken.statics.compareToken = async function (
  userId: string | Types.ObjectId,
  token: string
) {
  const userObjectId =
    typeof userId === "string" ? new Types.ObjectId(userId) : userId;
  const doc = await this.findOne({ user: userObjectId });
  if (!doc) return false;
  return compare(token, doc.token);
};

// Export VerificationToken model
export const VerificationToken = model<VerifyDocument, VerifyModel>(
  "VerificationToken", // Collection name in MongoDB
  verifyToken // Schema definition for VerificationToken collection
);
