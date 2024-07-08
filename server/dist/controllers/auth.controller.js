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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logOut = exports.sendProfile = exports.updateProfile = exports.signIn = exports.updatePassword = exports.isValidResetPassword = exports.grantValid = exports.forgetPassword = exports.reVerifyEmail = exports.verifyEmail = exports.signUpController = void 0;
const resetPassword_model_1 = require("../models/resetPassword.model");
const user_model_1 = require("../models/user.model");
const verification_model_1 = require("../models/verification.model");
const helper_1 = require("../utils/helper");
const mail_1 = require("../utils/mail");
const variables_1 = require("../utils/variables");
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cloud_1 = __importDefault(require("../cloud"));
const signUpController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = req.body;
    const user = yield user_model_1.User.create({ email, password, name });
    const token = (0, helper_1.generateToken)();
    yield (0, mail_1.sendVerificationMail)(token, {
        name,
        email,
        userId: user._id.toString(),
    });
    res.status(201).json({ user: { id: user._id, name, email } });
});
exports.signUpController = signUpController;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, userId } = req.body;
    let userObjectId;
    try {
        userObjectId = new mongoose_1.Types.ObjectId(userId);
    }
    catch (error) {
        return res.status(400).json({ error: "Invalid userId format" });
    }
    const matched = yield verification_model_1.VerificationToken.compareToken(userObjectId, token);
    if (!matched) {
        return res.status(403).json({ error: "Invalid token" });
    }
    yield user_model_1.User.findByIdAndUpdate(userObjectId, { verified: true });
    yield verification_model_1.VerificationToken.findOneAndDelete({ user: userObjectId });
    res.status(200).json({ message: "Email verified successfully" });
});
exports.verifyEmail = verifyEmail;
const reVerifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    let userObjectId;
    try {
        userObjectId = new mongoose_1.Types.ObjectId(userId);
    }
    catch (error) {
        return res.status(400).json({ error: "Invalid userId format" });
    }
    const user = yield user_model_1.User.findById(userObjectId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    yield verification_model_1.VerificationToken.findOneAndDelete({ user: userObjectId });
    const newToken = (0, helper_1.generateToken)();
    yield (0, mail_1.sendVerificationMail)(newToken, {
        name: user.name,
        email: user.email,
        userId: userObjectId.toString(),
    });
    res.status(200).json({ message: "Verification email sent again" });
});
exports.reVerifyEmail = reVerifyEmail;
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield user_model_1.User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    yield resetPassword_model_1.PasswordResetToken.findOneAndDelete({ user: user._id });
    const token = crypto_1.default.randomBytes(42).toString("hex");
    yield resetPassword_model_1.PasswordResetToken.create({
        user: user._id,
        token,
    });
    const resetLink = `${variables_1.PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;
    yield (0, mail_1.sendForgetPasswordLink)({ email: user.email, link: resetLink });
    res.status(200).json({ message: "Password reset email sent" });
});
exports.forgetPassword = forgetPassword;
const grantValid = (req, res) => {
    res.json({ valid: true });
};
exports.grantValid = grantValid;
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
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, userId } = req.body;
    if (!password || !userId) {
        return res.status(400).json({ error: "Password and userId are required" });
    }
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        return res.status(403).json({ error: "Unauthorized Access!" });
    }
    if (!user.password) {
        user.password = password;
        yield user.save();
        yield resetPassword_model_1.PasswordResetToken.findOneAndDelete({ user: user._id });
        (0, mail_1.ResetPasswordSucessMail)(user.name, user.email);
        return res.status(200).json({ message: "Password set successfully" });
    }
    try {
        const matched = yield (0, bcrypt_1.compare)(password, user.password);
        if (matched) {
            return res
                .status(422)
                .json({ error: "Password must be different than previous password!" });
        }
        user.password = password;
        yield user.save();
        yield resetPassword_model_1.PasswordResetToken.findOneAndDelete({ user: user._id });
        (0, mail_1.ResetPasswordSucessMail)(user.name, user.email);
        res.status(200).json({ message: "Password updated successfully" });
        resetPassword_model_1.PasswordResetToken.findOneAndDelete({ user: user._id });
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "An error occurred while updating the password" });
    }
});
exports.updatePassword = updatePassword;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, password } = req.body;
    const user = yield user_model_1.User.findOne({ email });
    if (!user || !user.verified) {
        return res
            .status(401)
            .json({ error: "Invalid email or unverified account" });
    }
    const isCorrectPassword = yield (0, bcrypt_1.compare)(password, user.password);
    if (!isCorrectPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, variables_1.JWT_SECRET, {
        expiresIn: "30d",
    });
    user.tokens.push(token);
    yield user.save();
    res.json({
        profile: {
            id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified,
            avatar: (_a = user.avatar) === null || _a === void 0 ? void 0 : _a.url,
            followers: user.followers.length,
            followings: user.following.length,
        },
        token,
        message: "Login successful",
    });
});
exports.signIn = signIn;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { name } = req.body;
    const avatar = (_a = req.files) === null || _a === void 0 ? void 0 : _a.avatar;
    const user = yield user_model_1.User.findById(req.user.id);
    if (!user) {
        throw new Error("Something went wrong! User is not logged in. Please login again and try again later");
    }
    if (typeof name !== "string") {
        return res.status(422).json({ error: "Name must be a string" });
    }
    if (name.trim().length < 3) {
        return res.status(422).json({ error: "Invalid Name" });
    }
    user.name = name;
    if (avatar) {
        if ((_b = user.avatar) === null || _b === void 0 ? void 0 : _b.publicId) {
            yield cloud_1.default.uploader.destroy(user.avatar.publicId);
        }
        const { secure_url, public_id } = yield cloud_1.default.uploader.upload(avatar.filepath, {
            transformation: {
                width: 300,
                height: 300,
                crop: "thumb",
                gravity: "face",
            },
        });
        user.avatar = { url: secure_url, publicId: public_id };
    }
    yield user.save();
    res.json({
        profile: (0, helper_1.formatProfile)(user),
    });
});
exports.updateProfile = updateProfile;
const sendProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        profile: req.user,
    });
});
exports.sendProfile = sendProfile;
const logOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { logOutAll } = req.query;
    const token = req.token;
    const user = yield user_model_1.User.findById(req.user.id);
    if (!user) {
        throw new Error("Something went wrong! User is not logged in. Please login again and try again later");
    }
    if (!token) {
        throw new Error("Invalid token. Please login again and try again later");
    }
    if (logOutAll === "true") {
        user.tokens = [];
    }
    else {
        user.tokens = user.tokens.filter((t) => t !== req.token);
    }
    yield user.save();
    res.status(200).json({ message: "Logged out successfully" });
});
exports.logOut = logOut;
