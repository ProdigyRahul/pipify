"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const music_controller_1 = require("../controllers/music.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const fileParser_1 = __importDefault(require("../middlewares/fileParser"));
const validator_1 = require("../middlewares/validator");
const validation_1 = require("../utils/validation");
const express_1 = require("express");
const musicRouter = (0, express_1.Router)();
musicRouter.post("/upload-music", auth_middleware_1.isAuth, auth_middleware_1.isVerified, fileParser_1.default, (0, validator_1.validate)(validation_1.MusicValidation), music_controller_1.uploadMusic);
musicRouter.patch("/:musicId", auth_middleware_1.isAuth, auth_middleware_1.isVerified, fileParser_1.default, (0, validator_1.validate)(validation_1.MusicValidation), music_controller_1.updateMusic);
exports.default = musicRouter;
