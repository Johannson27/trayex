import webpush from "web-push";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

webpush.setVapidDetails(
    "mailto:admin@trayex.com",
    process.env.VAPID_PUBLIC!,
    process.env.VAPID_PRIVATE!
);

// Guardar suscripción sin duplicar
export async function saveSubscription(sub: any, userId: string) {
    const exists = await prisma.pushSubscription.findFirst({
        where: { endpoint: sub.endpoint }
    });

    if (exists) return exists;

    return prisma.pushSubscription.create({
        data: {
            endpoint: sub.endpoint,
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
            userId
        },
    });
}

// Enviar push a un usuario específico
export async function sendPushToUser(userId: string, payload: any) {
    const subs = await prisma.pushSubscription.findMany({
        where: { userId }
    });

    const json = JSON.stringify(payload);

    for (const sub of subs) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                },
                json
            );
        } catch (err) {
            console.log("Error enviando push:", err);
        }
    }
}

// Broadcast a todos
export async function sendPushToAll(payload: any) {
    const subs = await prisma.pushSubscription.findMany();
    const body = JSON.stringify(payload);

    for (const sub of subs) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth },
                },
                body
            );
        } catch (err) {
            console.log("Error enviando push:", err);
        }
    }
}
