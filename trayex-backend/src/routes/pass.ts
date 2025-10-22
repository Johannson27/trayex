// src/routes/pass.ts
import { Router } from "express";
import { verifySessionToken } from "../services/jwt";
import { getOrCreateQrToken, rotateQrToken } from "../services/pass";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
    try {
        const auth = req.header("authorization") || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!token) return res.status(401).json({ error: "Missing token" });
        const payload = verifySessionToken(token); // { sub, role }
        (req as any).auth = payload;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}

/** GET /pass/qr  -> { qr: string } */
router.get("/qr", requireAuth, async (req, res) => {
    const { sub } = (req as any).auth;
    const qr = await getOrCreateQrToken(sub);
    return res.json({ qr });
});

/** POST /pass/rotate -> { qr: string }  (regenera cada vez que lo pidas) */
router.post("/rotate", requireAuth, async (req, res) => {
    const { sub } = (req as any).auth;
    const qr = await rotateQrToken(sub);
    return res.json({ qr });
});

export default router;
