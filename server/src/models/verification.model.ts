import { model, Model, Schema, Types } from "mongoose";
import { hash, compare } from "bcrypt";

interface VerifyDocument {
  user: Types.ObjectId;
  token: string;
  createdAt: Date;
}

interface VerifyModel extends Model<VerifyDocument> {
  compareToken(
    userId: string | Types.ObjectId,
    token: string
  ): Promise<boolean>;
}

const verifyToken = new Schema<VerifyDocument, VerifyModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  },
});

verifyToken.pre("save", async function (next) {
  if (!this.isModified("token")) return next();
  this.token = await hash(this.token, 10);
  next();
});

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

export const VerificationToken = model<VerifyDocument, VerifyModel>(
  "VerificationToken",
  verifyToken
);
