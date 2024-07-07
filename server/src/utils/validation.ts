import { isValidObjectId } from "mongoose";
import * as yup from "yup";
import { categories } from "./musicCategories";

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
    .min(8, "Please is too short")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/,
      "Password is too simple!"
    ),
});

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
    .min(8, "Please is too short")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/,
      "Password is too simple!"
    ),
});

export const signInValidation = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email! Please enter a valid email address")
    .required("Please enter a valid email address"),
  password: yup.string().trim().required("Please enter a valid password"),
});

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
