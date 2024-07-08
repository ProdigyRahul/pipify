"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
require("./db");
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const music_router_1 = __importDefault(require("./routers/music.router"));
const favourite_router_1 = __importDefault(require("./routers/favourite.router"));
const playlist_router_1 = __importDefault(require("./routers/playlist.router"));
const profile_router_1 = __importDefault(require("./routers/profile.router"));
const server = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
server.use(express_1.default.json());
server.use(express_1.default.urlencoded({ extended: false }));
server.use(express_1.default.static("src/public"));
server.use("/api/v1/auth", auth_router_1.default);
server.use("/api/v1/music", music_router_1.default);
server.use("/api/v1/favourite", favourite_router_1.default);
server.use("/api/v1/playlist", playlist_router_1.default);
server.use("/api/v1/profile", profile_router_1.default);
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:8080`);
});
