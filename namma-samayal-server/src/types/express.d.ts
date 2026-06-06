export {};

declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      role: "user" | "admin";
      email: string;
    }

    interface Request {
      user?: AuthUser;
      admin?: any;
    }
  }
}
