// src/routes/notifications.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "./auth";

export const notificationsRouter = Router();

/**
 * GET /me/notifications
 * Devuelve la lista de avisos del usuario autenticado en el formato que espera el front:
 * { id, title, body, channel, sentAt, read }
 */
notificationsRouter.get("/me/notifications", requireAuth, async (req, res) => {
    const userId = (req as any).auth.sub as string;

    const rows = await prisma.notification.findMany({
        where: { userId },
        orderBy: [{ sentAt: "desc" }, { id: "desc" }],
        select: {
            id: true,
            channel: true,
            template: true,
            payload: true, // puede venir como JSON o texto
            sentAt: true,
            status: true, // "READ" | "SENT" | ...
        },
    });

    const notifications = rows.map((n: any) => {
        // payload puede traer { title, body } — si no, usar template y stringify de payload
        let title = n.template ?? "";
        let body = "";

        if (n.payload && typeof n.payload === "object") {
            const p = n.payload as any;
            title = p.title ?? title ?? "";
            body = p.body ?? JSON.stringify(p);
        } else if (n.payload != null) {
            body = String(n.payload);
        }

        return {
            id: n.id,
            title,
            body,
            channel: n.channel,
            sentAt: n.sentAt,
            read: n.status === "READ",
        };
    });

    res.json({ notifications });
});

/**
 * POST /notifications/:id/read
 * Marca una notificación como leída (solo si pertenece al usuario)
 */
notificationsRouter.post("/notifications/:id/read", requireAuth, async (req, res) => {
    const userId = (req as any).auth.sub as string;
    const { id } = req.params;

    const n = await prisma.notification.findUnique({ where: { id } });
    if (!n || n.userId !== userId) {
        return res.status(404).json({ error: "No encontrada" });
    }

    await prisma.notification.update({
        where: { id },
        data: { status: "READ" },
    });

    res.json({ ok: true });
});

/**
 * POST /notifications/read-all
 * Marca todas las notificaciones del usuario como leídas
 */
notificationsRouter.post("/notifications/read-all", requireAuth, async (req, res) => {
    const userId = (req as any).auth.sub as string;

    await prisma.notification.updateMany({
        where: { userId, status: { not: "READ" } },
        data: { status: "READ" },
    });

    res.json({ ok: true });
});

