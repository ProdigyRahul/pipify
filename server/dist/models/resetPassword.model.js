"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetToken = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = require("bcrypt");
const passwordResetSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
passwordResetSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("token"))
            return next();
        this.token = yield (0, bcrypt_1.hash)(this.token, 10);
        next();
    });
});
passwordResetSchema.statics.compareToken = function (userId, token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId || !token) {
            console.error("compareToken: userId or token is missing");
            return false;
        }
        const userObjectId = typeof userId === "string" ? new mongoose_1.Types.ObjectId(userId) : userId;
        const doc = yield this.findOne({ user: userObjectId });
        if (!doc) {
            console.error(`compareToken: No document found for userId: ${userId}`);
            return false;
        }
        if (!doc.token) {
            console.error(`compareToken: Token is missing in document for userId: ${userId}`);
            return false;
        }
        try {
            return yield (0, bcrypt_1.compare)(token, doc.token);
        }
        catch (error) {
            console.error(`compareToken: Error during comparison: ${error}`);
            return false;
        }
    });
};
exports.PasswordResetToken = (0, mongoose_1.model)("PasswordResetToken", passwordResetSchema);
