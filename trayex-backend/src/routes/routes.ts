import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "./auth";

export const routesRouter = Router();

/** Lista de rutas con datos que tu UI espera */
routesRouter.get("/routes", async (_req, res) => {
    const rows = await prisma.route.findMany({
        orderBy: { createdAt: "asc" },
    });

    // adaptamos al shape del front
    const routes = rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description ?? null,
        mainStops: Array.isArray(r.mainStops) ? (r.mainStops as any[]) : [],
        status: r.status as "ACTIVE" | "SAFE" | "INCIDENT",
        estimatedTime: "15 min",
        capacity: "20/40",
        isFavorite: false,
    }));

    res.json({ routes });
});


routesRouter.post("/routes/:routeId/reserve-quick", requireAuth, async (req, res) => {
    const userId = (req as any).auth.sub as string;
    const { routeId } = req.params;

    // buscamos una zona y un timeslot próximos (seed abajo crea una "Zona Centro")
    const zone = await prisma.zone.findFirst({
        include: { stops: true, timeslots: true },
        orderBy: { name: "asc" },
    });
    if (!zone) return res.status(409).json({ error: "No hay zonas configuradas" });

    // timeslot futuro más cercano
    const now = new Date();
    const ts = await prisma.timeslot.findFirst({
        where: { zoneId: zone.id, startAt: { gt: now } },
        orderBy: { startAt: "asc" },
    });
    if (!ts) return res.status(409).json({ error: "No hay horarios disponibles" });

    const stop = zone.stops[0];
    if (!stop) return res.status(409).json({ error: "No hay paradas disponibles" });

    // capacidad simple
    const activeCount = await prisma.reservation.count({
        where: { timeslotId: ts.id, status: { in: ["PENDING", "CONFIRMED"] } },
    });
    if (activeCount >= ts.capacity) {
        return res.status(409).json({ error: "Capacidad llena" });
    }


    const r = await prisma.reservation.create({
        data: {
            userId,
            routeId,
            timeslotId: ts.id,
            stopId: stop.id,
            status: "CONFIRMED",
        },
        select: {
            id: true,
            status: true,
            createdAt: true,
            timeslot: { select: { startAt: true, endAt: true } },
            stop: { select: { name: true } },
        },
    });

    res.status(201).json({ reservation: r });
});

routesRouter.get("/routes", async (req, res) => {
    const routes = await prisma.route.findMany({
        orderBy: { createdAt: "asc" },
    });
    res.json({ routes });
});

// Demo: reservar rápido una ruta
routesRouter.post("/routes/:id/reserve-quick", async (req, res) => {
    const { id } = req.params;
    // por ahora solo devuelve ok:true
    res.json({ ok: true, reservation: { id, status: "CONFIRMED" } });
});

/** Lista de rutas (simple, para la UI) */
routesRouter.get("/routes", async (_req, res) => {
    const list = await prisma.route.findMany({
        orderBy: { createdAt: "asc" },
    });

    // Normaliza para tu UI actual
    const routes = list.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description ?? null,
        mainStops: Array.isArray(r.mainStops) ? (r.mainStops as string[]) : [],
        status: r.status,
        estimatedTime: "15 min",
        capacity: "12/40",
        isFavorite: false,
    }));

    res.json({ routes });
});

export default routesRouter;
