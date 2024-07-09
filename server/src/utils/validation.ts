import { isValidObjectId } from "mongoose";
import * as yup from "yup";
import { categories } from "./musicCategories";

/**
 * CreateUser Schema
 *
 * Defines the validation schema for creating a new user.
 * Requires 'name', 'email', and 'password' fields with specific constraints.
 */
export const CreateUser = yup.object().shape({
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
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/,
      "Password is too simple! Must contain at least one lowercase letter, one uppercase letter, one number, and one special character."
    ),
});

/**
 * PasswordResetTokenSchema
 *
 * Defines the validation schema for resetting a password with a token.
 * Requires 'token' and 'userId' fields with specific constraints.
 */
export const PasswordResetTokenSchema = yup.object().shape({
  token: yup
    .string()
    .trim()
    .required("Invalid token! Please enter a valid token"),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "Invalid user ID! Please enter a valid user ID";
    })
    .required("Invalid token! Please enter a valid token"),
});

/**
 * updatePasswordValidation Schema
 *
 * Defines the validation schema for updating a password.
 * Requires 'token', 'userId', and 'password' fields with specific constraints.
 */
export const updatePasswordValidation = yup.object().shape({
  token: yup
    .string()
    .trim()
    .required("Invalid token! Please enter a valid token"),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
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
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/,
      "Password is too simple! Must contain at least one lowercase letter, one uppercase letter, one number, and one special character."
    ),
});

/**
 * signInValidation Schema
 *
 * Defines the validation schema for user sign-in.
 * Requires 'email' and 'password' fields with specific constraints.
 */
export const signInValidation = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email! Please enter a valid email address")
    .required("Please enter a valid email address"),
  password: yup.string().trim().required("Please enter a valid password"),
});

/**
 * MusicValidation Schema
 *
 * Defines the validation schema for creating or updating music entries.
 * Requires 'title', 'about', and 'categories' fields with specific constraints,
 * where 'categories' must be one of the predefined categories.
 */
export const MusicValidation = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be at most 50 characters"),
  about: yup.string().required("About is required"),
  categories: yup
    .string()
    .oneOf(categories, "Invalid Category!")
    .required("Category is required"),
});

/**
 * PlaylistValidation Schema
 *
 * Defines the validation schema for creating or updating playlists.
 * Requires 'title', 'musicId', and 'visibility' fields with specific constraints,
 * where 'visibility' must be either 'public' or 'private'.
 */
export const PlaylistValidation = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be at most 50 characters"),
  musicId: yup.string().transform(function (value) {
    if (this.isType(value) && isValidObjectId(value)) {
      return value;
    } else {
      return "";
    }
  }),
  visibility: yup
    .string()
    .oneOf(["public", "private"], "Visibility must be public or private!")
    .required("Visibility is required"),
});

/**
 * OldPlaylistValidation Schema
 *
 * Defines the validation schema for updating an old playlist.
 * Requires 'title', 'item', 'id', and 'visibility' fields with specific constraints,
 * where 'item' and 'id' must be valid ObjectId strings and 'visibility' must be either 'public' or 'private'.
 */

export const OldPlaylistValidation = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be at most 50 characters"),
  // Music id validation
  item: yup.string().transform(function (value) {
    if (this.isType(value) && isValidObjectId(value)) {
      return value;
    } else {
      return "";
    }
  }),
  // Playlist id
  id: yup.string().transform(function (value) {
    if (this.isType(value) && isValidObjectId(value)) {
      return value;
    } else {
      return "";
    }
  }),
  visibility: yup
    .string()
    .oneOf(["public", "private"], "Visibility must be public or private!")
    .required("Visibility is required"),
});

export const HistorySchema = yup.object().shape({
  music: yup
    .string()
    .transform(function (value) {
      return this.isType(value) && isValidObjectId(value) ? value : "";
    })
    .required("Invalid music id!"),
  progress: yup.number().required("History progress is missing!"),
  date: yup
    .string()
    .transform(function (value) {
      const date = new Date(value);
      if (date instanceof Date) return value;
      return "";
    })
    .required("Invalid date!"),
});
