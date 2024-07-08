"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const favouriteSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Music" }],
}, { timestamps: true });
const Favourite = mongoose_1.models.Favourite || (0, mongoose_1.model)("Favourite", favouriteSchema);
exports.default = Favourite;
