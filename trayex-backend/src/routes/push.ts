import { Router } from "express";
import { saveSubscription, sendPushToAll } from "../lib/push";

export const pushRouter = Router();

// Guardar la suscripción
pushRouter.post("/subscribe", async (req, res) => {
    try {
        const { sub, userId } = req.body;

        if (!sub || !sub.endpoint || !userId)
            return res.status(400).json({ error: "Datos inválidos" });

        await saveSubscription(sub, userId);

        res.json({ ok: true });
    } catch (e) {
        console.error("Error guardando suscripción:", e);
        res.status(500).json({ error: "Error guardando suscripción" });
    }
});

// Enviar push de prueba
pushRouter.post("/send", async (req, res) => {
    try {
        const { title, body } = req.body;

        await sendPushToAll({ title, body });

        res.json({ ok: true });
    } catch (e) {
        console.error("Error enviando push:", e);
        res.status(500).json({ error: "Error enviando notificaciones" });
    }
});
