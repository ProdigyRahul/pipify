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
exports.isfavourite = exports.getFavourites = exports.toggleFavourite = void 0;
const favourite_model_1 = __importDefault(require("../models/favourite.model"));
const music_model_1 = __importDefault(require("../models/music.model"));
const mongoose_1 = require("mongoose");
const toggleFavourite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const musicId = req.query.musicId;
    if (!(0, mongoose_1.isValidObjectId)(musicId)) {
        return res.status(422).json({ error: "Invalid musicId" });
    }
    const music = yield music_model_1.default.findById(musicId);
    if (!music) {
        return res.status(404).json({ error: "Music not found" });
    }
    let status_music;
    let message;
    const alreadyExistMusic = yield favourite_model_1.default.findOne({
        user: req.user.id,
        items: musicId,
    });
    if (alreadyExistMusic) {
        yield favourite_model_1.default.updateOne({ user: req.user.id }, {
            $pull: { items: musicId },
        });
        status_music = "removed";
        message = "Removed from favorites";
    }
    else {
        const favourite = yield favourite_model_1.default.findOne({ user: req.user.id });
        if (favourite) {
            yield favourite_model_1.default.updateOne({ user: req.user.id }, {
                $addToSet: { items: musicId },
            });
        }
        else {
            yield favourite_model_1.default.create({
                user: req.user.id,
                items: [musicId],
            });
        }
        status_music = "added";
        message = "Added to favorites";
    }
    if (status_music === "added") {
        yield music_model_1.default.findByIdAndUpdate(musicId, {
            $addToSet: { likes: req.user.id },
        });
    }
    if (status_music === "removed") {
        yield music_model_1.default.findByIdAndUpdate(musicId, {
            $pull: { likes: req.user.id },
        });
    }
    return res.json({ status: status_music, message: message });
});
exports.toggleFavourite = toggleFavourite;
const getFavourites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const favourites = yield favourite_model_1.default.findOne({ user: userId }).populate({
        path: "items",
        populate: {
            path: "user",
        },
    });
    if (!favourites) {
        return res.status(404).json({ error: "Favourites not found", musics: [] });
    }
    const musics = favourites.items.map((item) => {
        var _a;
        return ({
            id: item._id,
            title: item.title,
            categories: item.categories,
            file: item.file.url,
            thumbnail: (_a = item.thumbnail) === null || _a === void 0 ? void 0 : _a.url,
            user: {
                name: item.user.name,
                id: item.user._id,
            },
        });
    });
    res.json({ musics });
});
exports.getFavourites = getFavourites;
const isfavourite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const musicId = req.query.musicId;
    if (!(0, mongoose_1.isValidObjectId)(musicId)) {
        return res.status(422).json({ error: "Invalid musicId" });
    }
    const favourite = yield favourite_model_1.default.findOne({
        user: req.user.id,
        items: musicId,
    });
    if (favourite) {
        res.json({ isFavourite: true });
    }
    else {
        res.json({ isFavourite: false });
    }
});
exports.isfavourite = isfavourite;
