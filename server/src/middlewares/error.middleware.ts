import { ErrorRequestHandler } from "express";

/**
 * @desc    Error Handling Middleware
 * @route   Global Middleware
 * @access  Public
 *
 * Handles errors that occur during request processing and sends a JSON response
 * with the error message and a 500 status code.
 *
 * @param   {Error} err - The error object
 * @param   {Request} req - The HTTP request object
 * @param   {Response} res - The HTTP response object
 * @param   {NextFunction} next - The next middleware function
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json({ error: err.message });
};
