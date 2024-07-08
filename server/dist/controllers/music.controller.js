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
exports.updateMusic = exports.uploadMusic = void 0;
const cloud_1 = __importDefault(require("../cloud"));
const music_model_1 = __importDefault(require("../models/music.model"));
const uploadMusic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { title, about, categories } = req.body;
    const thumbnail = (_a = req.files) === null || _a === void 0 ? void 0 : _a.thumbnail;
    const musicFile = (_b = req.files) === null || _b === void 0 ? void 0 : _b.file;
    const userId = req.user.id;
    if (!musicFile) {
        return res.status(400).json({ error: "Music File is missing!" });
    }
    const musicRes = yield cloud_1.default.uploader.upload(musicFile.filepath, {
        resource_type: "video",
    });
    const newMusic = new music_model_1.default({
        title,
        about,
        categories,
        user: userId,
        file: { url: musicRes.url, publicId: musicRes.publicId },
    });
    if (thumbnail) {
        const thumbnailRes = yield cloud_1.default.uploader.upload(thumbnail.filepath, {
            width: 200,
            height: 200,
            crop: "fill",
        });
        newMusic.thumbnail = {
            url: thumbnailRes.secure_url,
            publicId: thumbnailRes.publicId,
        };
    }
    yield newMusic.save();
    res.status(201).json({
        music: {
            title: newMusic.title,
            about: newMusic.about,
            file: newMusic.file,
            poster: (_c = newMusic.thumbnail) === null || _c === void 0 ? void 0 : _c.url,
        },
    });
});
exports.uploadMusic = uploadMusic;
const updateMusic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { title, about, categories } = req.body;
    const thumbnail = (_a = req.files) === null || _a === void 0 ? void 0 : _a.thumbnail;
    const userId = req.user.id;
    const { musicId } = req.params;
    const music = yield music_model_1.default.findOneAndUpdate({ _id: musicId, user: userId }, { title, about, categories }, { new: true });
    if (!music) {
        return res.status(404).json({ error: "Music not found!" });
    }
    if (thumbnail) {
        if ((_b = music.thumbnail) === null || _b === void 0 ? void 0 : _b.publicId) {
            yield cloud_1.default.uploader.destroy(music.thumbnail.publicId);
        }
        const thumbnailRes = yield cloud_1.default.uploader.upload(thumbnail.filepath, {
            width: 200,
            height: 200,
            crop: "fill",
        });
        music.thumbnail = {
            url: thumbnailRes.secure_url,
            publicId: thumbnailRes.publicId,
        };
        yield music.save();
    }
    res.json({
        music: {
            title: music.title,
            about: music.about,
            file: music.file,
            poster: (_c = music.thumbnail) === null || _c === void 0 ? void 0 : _c.url,
        },
    });
});
exports.updateMusic = updateMusic;
