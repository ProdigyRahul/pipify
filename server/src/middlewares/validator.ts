import { RequestHandler } from "express";
import * as yup from "yup";

// Middleware to validate request body against a schema using yup
export const validate = (schema: any): RequestHandler => {
  return async (req, res, next) => {
    // Check if request body exists
    if (!req.body) {
      return res.status(400).json({ error: "No request body" });
    }

    // Create yup schema to validate req.body
    const schemaToValidate = yup.object({
      body: schema, // Define the schema to validate against
    });

    try {
      // Validate req.body against the defined schema
      await schemaToValidate.validate(
        {
          body: req.body,
        },
        {
          abortEarly: true, // Abort validation on first validation error
        }
      );
      next(); // Proceed to the next middleware if validation passes
    } catch (error) {
      // Handle validation errors
      if (error instanceof yup.ValidationError) {
        res.status(422).json({
          error: error.message, // Send validation error message as response
        });
      }
    }
  };
};
