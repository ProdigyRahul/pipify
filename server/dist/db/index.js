"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const variables_1 = require("../utils/variables");
mongoose_1.default
    .connect(variables_1.MONGO_URI)
    .then(() => {
    console.log("Database Successfully Connected");
})
    .catch((error) => {
    console.log("Database Connection Failed: ", error);
});
