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
exports.getPublicPlaylists = exports.getPublicProfile = exports.getPublicUploads = exports.getUploads = exports.updateFollower = void 0;
const music_model_1 = __importDefault(require("../models/music.model"));
const playlist_model_1 = __importDefault(require("../models/playlist.model"));
const user_model_1 = require("../models/user.model");
const mongoose_1 = require("mongoose");
const updateFollower = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profileId } = req.params;
    let status;
    if (!(0, mongoose_1.isValidObjectId)(profileId)) {
        return res.status(422).json({ error: "Unauthorized Access!" });
    }
    const user = yield user_model_1.User.findById(profileId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const alreadyFollower = yield user_model_1.User.findOne({
        _id: profileId,
        followers: req.user.id,
    });
    if (alreadyFollower) {
        yield user_model_1.User.updateOne({
            _id: profileId,
        }, {
            $pull: { followers: req.user.id },
        });
        status = "removed";
    }
    else {
        yield user_model_1.User.updateOne({
            _id: profileId,
        }, {
            $addToSet: { followers: req.user.id },
        });
        status = "added";
    }
    if (status === "added") {
        yield user_model_1.User.updateOne({
            _id: req.user.id,
        }, {
            $addToSet: { following: profileId },
        });
    }
    if (status === "removed") {
        yield user_model_1.User.updateOne({
            _id: req.user.id,
        }, {
            $pull: { following: profileId },
        });
    }
    res.json({ status });
});
exports.updateFollower = updateFollower;
const getUploads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { skip = "0", limit = "10" } = req.query;
    const data = yield music_model_1.default.find({
        user: req.user.id,
    })
        .skip(parseInt(skip) * parseInt(limit))
        .limit(parseInt(limit))
        .sort("-createdAt");
    const musics = data.map((item) => {
        var _a;
        return {
            id: item._id,
            title: item.title,
            about: item.about,
            categories: item.categories,
            file: item.file.url,
            thumbnail: (_a = item.thumbnail) === null || _a === void 0 ? void 0 : _a.url,
            date: item.createdAt,
            user: {
                name: req.user.name,
                id: req.user.id,
            },
        };
    });
    res.json({ musics });
});
exports.getUploads = getUploads;
const getPublicUploads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { skip = "0", limit = "10" } = req.query;
    const { profileId } = req.params;
    if (!(0, mongoose_1.isValidObjectId)(profileId)) {
        return res.status(422).json({ error: "Unauthorized Access!" });
    }
    const data = yield music_model_1.default.find({
        user: profileId,
    })
        .skip(parseInt(skip) * parseInt(limit))
        .limit(parseInt(limit))
        .sort("-createdAt")
        .populate("user");
    const musics = data.map((item) => {
        var _a;
        return {
            id: item._id,
            title: item.title,
            about: item.about,
            categories: item.categories,
            file: item.file.url,
            thumbnail: (_a = item.thumbnail) === null || _a === void 0 ? void 0 : _a.url,
            date: item.createdAt,
            user: {
                name: item.user.name,
                id: item.user._id,
            },
        };
    });
    res.json({ musics });
});
exports.getPublicUploads = getPublicUploads;
const getPublicProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { profileId } = req.params;
    if (!(0, mongoose_1.isValidObjectId)(profileId)) {
        return res.status(422).json({ error: "Unauthorized Access!" });
    }
    const user = yield user_model_1.User.findById(profileId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json({
        profile: {
            id: user._id,
            name: user.name,
            followers: user.followers.length,
            avatar: (_a = user.avatar) === null || _a === void 0 ? void 0 : _a.url,
        },
    });
});
exports.getPublicProfile = getPublicProfile;
const getPublicPlaylists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profileId } = req.params;
    const { skip = "0", limit = "10" } = req.query;
    if (!(0, mongoose_1.isValidObjectId)(profileId)) {
        return res.status(422).json({ error: "Unauthorized Access!" });
    }
    const playlists = yield playlist_model_1.default.find({
        user: profileId,
        visibility: "public",
    })
        .skip(parseInt(limit) * parseInt(skip))
        .limit(parseInt(limit))
        .sort("-createdAt");
    res.json({
        playlists: playlists.map((item) => {
            return {
                id: item._id,
                title: item.title,
                itemsCount: item.items.length,
                visibility: item.visibility,
            };
        }),
    });
});
exports.getPublicPlaylists = getPublicPlaylists;
