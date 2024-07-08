"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const musicCategories_1 = require("../utils/musicCategories");
const mongoose_1 = require("mongoose");
const MusicSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    about: {
        type: String,
        required: true,
    },
    file: {
        type: Object,
        url: String,
        publicId: String,
        required: true,
    },
    thumbnail: {
        type: Object,
        url: String,
        publicId: String,
    },
    likes: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    categories: {
        type: String,
        enum: musicCategories_1.categories,
        required: true,
        default: "Others",
    },
}, { timestamps: true });
const Music = mongoose_1.models.Music || (0, mongoose_1.model)("Music", MusicSchema);
exports.default = Music;
