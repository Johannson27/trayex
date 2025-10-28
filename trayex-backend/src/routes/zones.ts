import { Router } from "express";
import { prisma } from "../prisma";

export const zonesRouter = Router();

// (Opcional) lista zonas
zonesRouter.get("/zones", async (_req, res) => {
    const zones = await prisma.zone.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
    res.json({ zones });
});

// Stops por zona
zonesRouter.get("/zones/:zoneId/stops", async (req, res) => {
    const { zoneId } = req.params;
    const stops = await prisma.stop.findMany({
        where: { zoneId },
        select: { id: true, name: true, lat: true, lng: true, isSafe: true },
        orderBy: { name: "asc" },
    });
    res.json({ stops });
});

// Timeslots futuros por zona
zonesRouter.get("/zones/:zoneId/timeslots", async (req, res) => {
    const { zoneId } = req.params;
    const from = req.query.from ? new Date(String(req.query.from)) : new Date();
    const limit = req.query.limit ? Number(req.query.limit) : 6;

    const timeslots = await prisma.timeslot.findMany({
        where: { zoneId, startAt: { gte: from } },
        orderBy: { startAt: "asc" },
        take: limit,
        select: { id: true, startAt: true, endAt: true, capacity: true },
    });

    res.json({ timeslots });
});
