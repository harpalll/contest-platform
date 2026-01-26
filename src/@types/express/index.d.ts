import { Request } from "express";

interface User {
  id: number;
  name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      // Add your custom properties here
      user?: User;
    }
  }
}
export {};
