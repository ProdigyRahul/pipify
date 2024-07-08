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
exports.VerificationToken = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = require("bcrypt");
const verifyToken = new mongoose_1.Schema({
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
verifyToken.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("token"))
            return next();
        this.token = yield (0, bcrypt_1.hash)(this.token, 10);
        next();
    });
});
verifyToken.statics.compareToken = function (userId, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const userObjectId = typeof userId === "string" ? new mongoose_1.Types.ObjectId(userId) : userId;
        const doc = yield this.findOne({ user: userObjectId });
        if (!doc)
            return false;
        return (0, bcrypt_1.compare)(token, doc.token);
    });
};
exports.VerificationToken = (0, mongoose_1.model)("VerificationToken", verifyToken);
