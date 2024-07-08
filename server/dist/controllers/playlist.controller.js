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
exports.getMusics = exports.getPlaylists = exports.removePlaylist = exports.updatePlaylist = exports.createPlaylist = void 0;
const music_model_1 = __importDefault(require("../models/music.model"));
const playlist_model_1 = __importDefault(require("../models/playlist.model"));
const mongoose_1 = require("mongoose");
const createPlaylist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, musicId, visibility } = req.body;
    const userId = req.user.id;
    if (musicId) {
        const music = yield music_model_1.default.findById(musicId);
        if (!music) {
            return res.status(404).json({ error: "Music not found" });
        }
    }
    const playlist = new playlist_model_1.default({
        title,
        user: userId,
        visibility,
    });
    if (musicId) {
        playlist.items = [musicId];
    }
    yield playlist.save();
    res.status(201).json({
        playlist: {
            id: playlist._id,
            title: playlist.title,
            visibility: playlist.visibility,
        },
    });
});
exports.createPlaylist = createPlaylist;
const updatePlaylist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, item, title, visibility } = req.body;
    const playlist = yield playlist_model_1.default.findOneAndUpdate({ _id: id, user: req.user.id }, { title, visibility }, { new: true });
    if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
    }
    if (item) {
        const music = yield music_model_1.default.findById(item);
        if (!music) {
            return res.status(404).json({ error: "Music not found" });
        }
        yield playlist_model_1.default.findByIdAndUpdate(playlist._id, {
            $addToSet: { items: item },
        });
    }
    res.json({
        playlist: {
            id: playlist._id,
            title: playlist.title,
            visibility: playlist.visibility,
        },
    });
});
exports.updatePlaylist = updatePlaylist;
const removePlaylist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { playlistId, musicId, all } = req.query;
    if (!(0, mongoose_1.isValidObjectId)(playlistId)) {
        return res.status(422).json({ error: "Invalid Playlist" });
    }
    if (all === "yes") {
        const playlist = yield playlist_model_1.default.findOneAndDelete({
            _id: playlistId,
            user: req.user.id,
        });
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }
    }
    if (musicId) {
        if (!(0, mongoose_1.isValidObjectId)(musicId)) {
            return res.status(422).json({ error: "Invalid Music" });
        }
        const playlist = yield playlist_model_1.default.findOneAndUpdate({ _id: playlistId, user: req.user.id }, {
            $pull: { items: musicId },
        }, { new: true });
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }
    }
    res.status(200).json({ success: true });
});
exports.removePlaylist = removePlaylist;
const getPlaylists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { skip = "0", limit = "10" } = req.query;
    const playlist = yield playlist_model_1.default.find({
        user: req.user.id,
        visibility: { $ne: "auto-generated" },
    })
        .skip(parseInt(skip) * parseInt(limit))
        .limit(parseInt(limit))
        .sort("-createdAt");
    const newPlaylist = playlist.map((item) => {
        return {
            id: item._id,
            title: item.title,
            itemsCount: item.items.length,
            visibility: item.visibility,
        };
    });
    res.json({ playlists: newPlaylist });
});
exports.getPlaylists = getPlaylists;
const getMusics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { playlistId } = req.params;
    if (!(0, mongoose_1.isValidObjectId)(playlistId)) {
        return res.status(422).json({ error: "Invalid playlistId" });
    }
    const playlist = yield playlist_model_1.default.findOne({
        user: req.user.id,
        _id: playlistId,
    }).populate({
        path: "items",
        populate: {
            path: "user",
            select: "name",
        },
    });
    if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
    }
    const musics = playlist.items.map((item) => {
        var _a;
        return {
            id: item._id,
            title: item.title,
            categories: item.categories,
            file: item.file.url,
            thumbnail: (_a = item.thumbnail) === null || _a === void 0 ? void 0 : _a.url,
            user: { name: item.user.name, id: item.user._id },
        };
    });
    res.json({
        list: {
            id: playlist._id,
            title: playlist.title,
            musics,
        },
    });
});
exports.getMusics = getMusics;
