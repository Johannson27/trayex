// backend/src/routes/pass.ts
import { Router } from "express";
import { requireAuth } from "./auth";
import { signQr } from "../services/jwt";

export const passRouter = Router();

passRouter.get("/pass/qr", requireAuth, async (req, res) => {
    const { sub, role } = (req as any).auth as { sub: string; role: string };
    const qr = signQr({ sub, role, ts: Date.now(), kind: "BOARDING_PASS" }, 60 * 15);
    res.json({ qr });
});

passRouter.post("/pass/qr/rotate", requireAuth, async (req, res) => {
    const { sub, role } = (req as any).auth as { sub: string; role: string };
    const qr = signQr({ sub, role, ts: Date.now(), kind: "BOARDING_PASS" }, 60 * 15);
    res.json({ qr });
});

export default passRouter;
