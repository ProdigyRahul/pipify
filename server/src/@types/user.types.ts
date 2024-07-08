/**
 * Augments the existing Request interface in Express to include custom properties
 * related to user authentication and authorization.
 */
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: any; // User's unique identifier
        name: string; // User's name
        email: string; // User's email address
        verified: boolean; // Indicates if the user's email is verified
        avatar?: string; // URL of the user's avatar (optional)
        followers: number; // Number of followers the user has
        following: number; // Number of users the user is following
      };
      token: string; // JWT token associated with the request
    }
  }
}

/**
 * Represents the structure of a request to create a new user,
 * extending the standard Express Request interface.
 */
export interface NewUser extends Request {
  body: {
    name: string; // User's name
    email: string; // User's email address
    password: string; // User's password
  };
}

/**
 * Represents the structure of a request to verify a user's email,
 * extending the standard Express Request interface.
 */
export interface VerifyEmail extends Request {
  body: {
    userId: string; // User's unique identifier
    token: string; // Token used for email verification
  };
}
