// src/services/pass.ts
import crypto from "crypto";
import { prisma } from "../prisma";

function genToken() {
    // token corto, URL-safe
    return crypto.randomBytes(24).toString("base64url");
}

/** Devuelve el qrToken; si no existe, lo crea. */
export async function getOrCreateQrToken(userId: string) {
    const profile = await prisma.studentProfile.upsert({
        where: { userId },
        update: {},
        create: { userId },
    });

    if (!profile.qrToken) {
        const qrToken = genToken();
        const updated = await prisma.studentProfile.update({
            where: { userId },
            data: { qrToken },
            select: { qrToken: true },
        });
        return updated.qrToken!;
    }
    return profile.qrToken;
}

/** Rota (regenera) el qrToken y lo devuelve. */
export async function rotateQrToken(userId: string) {
    const qrToken = genToken();
    const updated = await prisma.studentProfile.update({
        where: { userId },
        data: { qrToken },
        select: { qrToken: true },
    });
    return updated.qrToken!;
}
