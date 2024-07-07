import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: any;
        name: string;
        email: string;
        verified: boolean;
        avatar?: string;
        followers: number;
        following: number;
      };
      token: string;
    }
  }
}

export interface NewUser extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

export interface VerifyEmail extends Request {
  body: {
    userId: string;
    token: string;
  };
}
