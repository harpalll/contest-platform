import { Request } from "express";
type UserRole = "creator" | "contestee";

interface User {
  id: number;
  name: string;
  role: UserRole;
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
