// src/routes/catalog.ts
import { Router } from "express";
import { prisma } from "../prisma";

export const catalogRouter = Router();

/** ZONAS con paradas (ligero) */
catalogRouter.get("/zones", async (_req, res) => {
  const zones = await prisma.zone.findMany({
    select: {
      id: true,
      name: true,
      stops: {
        select: { id: true, name: true, lat: true, lng: true, isSafe: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
  res.json({ zones });
});

/** TIMESLOTS por zona y fecha (YYYY-MM-DD) */
catalogRouter.get("/timeslots", async (req, res) => {
  const { zoneId, date } = req.query as { zoneId?: string; date?: string };
  if (!zoneId || !date) {
    return res.status(400).json({ error: "zoneId y date (YYYY-MM-DD) son requeridos" });
  }

  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);

  const slots = await prisma.timeslot.findMany({
    where: { zoneId, startAt: { gte: start }, endAt: { lte: end } },
    orderBy: { startAt: "asc" },
    select: {
      id: true,
      startAt: true,
      endAt: true,
      capacity: true,
      reservations: {
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
        select: { id: true },
      },
    },
  });

  const enriched = slots.map(s => ({
    ...s,
    reservedCount: s.reservations.length,
    reservations: undefined as any, // ocultamos arreglo crudo
  }));

  res.json({ timeslots: enriched });
});

catalogRouter.get('/stops', (req, res) => {
  const { zone } = req.query;
  res.json([{ id: 's1', zoneId: zone || 'z1', name: 'Parada A', lat: 12.12, lng: -86.25, isSafe: true }]);
});