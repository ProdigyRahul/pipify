import * as yup from "yup";

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
