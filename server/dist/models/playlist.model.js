"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const playlistSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Music",
            required: true,
        },
    ],
    visibility: {
        type: String,
        enum: ["public", "private", "auto-generated"],
        required: true,
        default: "public",
    },
}, { timestamps: true });
const Playlist = mongoose_1.models.Playlist || (0, mongoose_1.model)("Playlist", playlistSchema);
exports.default = Playlist;
