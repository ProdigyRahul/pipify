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
exports.isVerified = exports.isAuth = exports.isValidResetPassword = void 0;
const resetPassword_model_1 = require("../models/resetPassword.model");
const user_model_1 = require("../models/user.model");
const variables_1 = require("../utils/variables");
const jsonwebtoken_1 = require("jsonwebtoken");
const isValidResetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, token } = req.body;
    if (!userId || !token) {
        return res.status(400).json({ error: "UserId and token are required" });
    }
    try {
        const isValid = yield resetPassword_model_1.PasswordResetToken.compareToken(userId, token);
        if (!isValid) {
            return res.status(403).json({ error: "Invalid token" });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.isValidResetPassword = isValidResetPassword;
const isAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { authorization } = req.headers;
    const token = authorization === null || authorization === void 0 ? void 0 : authorization.split("Bearer ")[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized Access!" });
    }
    const payload = (0, jsonwebtoken_1.verify)(token, variables_1.JWT_SECRET);
    const userId = payload.userId;
    const user = yield user_model_1.User.findOne({ _id: userId, tokens: token });
    if (!user) {
        return res.status(403).json({ error: "Unauthorized Access!" });
    }
    req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        avatar: (_a = user.avatar) === null || _a === void 0 ? void 0 : _a.url,
        followers: user.followers.length,
        following: user.following.length,
    };
    req.token = token;
    next();
});
exports.isAuth = isAuth;
const isVerified = (req, res, next) => {
    if (!req.user.verified) {
        return res
            .status(403)
            .json({ error: "Unauthorized Access! Not Verified User" });
    }
    next();
};
exports.isVerified = isVerified;
