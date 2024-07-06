"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
require("./db");
const server = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
server.use(express_1.default.json());
server.use(express_1.default.urlencoded({ extended: false }));
server.listen(8080, () => {
    console.log(`Server is running at http://localhost:8080`);
});
