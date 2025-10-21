// src/routes/profile.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { verifySessionToken } from "../services/jwt";

const profileRouter = Router();

// mini helper para auth rápida (sin middleware global aún)
function getUserIdFromAuth(req: any): string {
    const auth = req.header("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) throw new Error("Missing token");
    const payload = verifySessionToken(token);
    if (!payload?.sub) throw new Error("Invalid token");
    return String(payload.sub);
}

/** GET /me/profile: devuelve user + studentProfile */
profileRouter.get("/me/profile", async (req, res) => {
    try {
        const userId = getUserIdFromAuth(req);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { student: true }, // student = StudentProfile
        });
        if (!user) return res.status(404).json({ error: "User not found" });

        return res.json({
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
            profile: user.student ?? null,
        });
    } catch (e: any) {
        return res.status(401).json({ error: e?.message ?? "Unauthorized" });
    }
});

/** PATCH /me/profile: actualiza StudentProfile */
profileRouter.patch("/me/profile", async (req, res) => {
    try {
        const userId = getUserIdFromAuth(req);
        const { fullName, bloodType, idNumber, university, emergencyName, emergencyContact } = req.body ?? {};

        // asegúrate de que exista el perfil
        const existing = await prisma.studentProfile.findUnique({ where: { userId } });
        if (!existing) {
            await prisma.studentProfile.create({ data: { userId } });
        }

        const updated = await prisma.studentProfile.update({
            where: { userId },
            data: {
                fullName: fullName?.trim() ?? undefined,
                bloodType: bloodType ?? undefined,
                idNumber: idNumber ?? undefined,
                university: university ?? undefined,
                emergencyName: emergencyName ?? undefined,
                emergencyContact: emergencyContact ?? undefined,
            },
        });

        return res.json({ profile: updated });
    } catch (e: any) {
        return res.status(400).json({ error: e?.message ?? "Update failed" });
    }
});

export default profileRouter;
