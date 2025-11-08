import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const h = req.headers.authorization || "";
    const [, token] = h.split(" "); // "Bearer <token>"

    if (!token) return res.status(401).json({ error: "Missing token" });

    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        (req as any).auth = { sub: payload.sub, role: payload.role };
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
