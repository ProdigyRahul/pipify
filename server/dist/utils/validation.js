"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OldPlaylistValidation = exports.PlaylistValidation = exports.MusicValidation = exports.signInValidation = exports.updatePasswordValidation = exports.PasswordResetTokenSchema = exports.CreateUser = void 0;
const mongoose_1 = require("mongoose");
const yup = __importStar(require("yup"));
const musicCategories_1 = require("./musicCategories");
exports.CreateUser = yup.object().shape({
    name: yup
        .string()
        .trim()
        .required("Name is required")
        .min(3, "Name must be at least 3 characters")
        .max(20, "Name must be at most 20 characters"),
    email: yup
        .string()
        .email("Invalid email! Please enter a valid email address")
        .required("Please enter a valid email address"),
    password: yup
        .string()
        .trim()
        .required("Please enter a valid password")
        .min(8, "Password is too short")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/, "Password is too simple! Must contain at least one lowercase letter, one uppercase letter, one number, and one special character."),
});
exports.PasswordResetTokenSchema = yup.object().shape({
    token: yup
        .string()
        .trim()
        .required("Invalid token! Please enter a valid token"),
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "Invalid user ID! Please enter a valid user ID";
    })
        .required("Invalid token! Please enter a valid token"),
});
exports.updatePasswordValidation = yup.object().shape({
    token: yup
        .string()
        .trim()
        .required("Invalid token! Please enter a valid token"),
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "Invalid user ID! Please enter a valid user ID";
    })
        .required("Invalid token! Please enter a valid token"),
    password: yup
        .string()
        .trim()
        .required("Please enter a valid password")
        .min(8, "Password is too short")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/, "Password is too simple! Must contain at least one lowercase letter, one uppercase letter, one number, and one special character."),
});
exports.signInValidation = yup.object().shape({
    email: yup
        .string()
        .email("Invalid email! Please enter a valid email address")
        .required("Please enter a valid email address"),
    password: yup.string().trim().required("Please enter a valid password"),
});
exports.MusicValidation = yup.object().shape({
    title: yup
        .string()
        .required("Title is required")
        .min(3, "Title must be at least 3 characters")
        .max(50, "Title must be at most 50 characters"),
    about: yup.string().required("About is required"),
    categories: yup
        .string()
        .oneOf(musicCategories_1.categories, "Invalid Category!")
        .required("Category is required"),
});
exports.PlaylistValidation = yup.object().shape({
    title: yup
        .string()
        .required("Title is required")
        .min(3, "Title must be at least 3 characters")
        .max(50, "Title must be at most 50 characters"),
    musicId: yup.string().transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        else {
            return "";
        }
    }),
    visibility: yup
        .string()
        .oneOf(["public", "private"], "Visibility must be public or private!")
        .required("Visibility is required"),
});
exports.OldPlaylistValidation = yup.object().shape({
    title: yup
        .string()
        .required("Title is required")
        .min(3, "Title must be at least 3 characters")
        .max(50, "Title must be at most 50 characters"),
    item: yup.string().transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        else {
            return "";
        }
    }),
    id: yup.string().transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        else {
            return "";
        }
    }),
    visibility: yup
        .string()
        .oneOf(["public", "private"], "Visibility must be public or private!")
        .required("Visibility is required"),
});
