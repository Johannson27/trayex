import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Qué información llevará req.user
export interface AuthUser {
  id: string;
  role: string;
}

// Extender el tipo de Express para incluir req.user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Middleware: Validar token
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      title: "Unauthorized",
      status: 401,
      detail: "Missing token",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev") as any;

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      title: "Unauthorized",
      status: 401,
      detail: "Invalid token",
    });
  }
}

// Middleware opcional: Validar que el usuario tenga cierto rol
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        title: "Unauthorized",
        status: 401,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        title: "Forbidden",
        status: 403,
      });
    }

    next();
  };
}
