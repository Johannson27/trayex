// src/routes/reservations.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "./auth"; // asegúrate que requireAuth esté exportado en ./auth
import { signQr } from "../services/jwt";
import { ReservationStatus } from "@prisma/client";

export const reservationRouter = Router();

reservationRouter.post("/reservations", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub as string;
    const { timeslotId, stopId } = req.body ?? {};
    if (!timeslotId || !stopId) {
      return res.status(400).json({ error: "timeslotId y stopId son requeridos" });
    }

    // Validar existencia
    const [timeslot, stop] = await Promise.all([
      prisma.timeslot.findUnique({ where: { id: timeslotId } }),
      prisma.stop.findUnique({ where: { id: stopId } }),
    ]);
    if (!timeslot || !stop) return res.status(404).json({ error: "Timeslot o Stop no encontrado" });

    // Capacidad
    const activeCount = await prisma.reservation.count({
      where: { timeslotId, status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] } },
    });
    if (activeCount >= timeslot.capacity) {
      return res.status(409).json({ error: "Capacidad llena" });
    }

    // QR offline simple
    const qrPayload = { uid: userId, ts: timeslotId, st: stopId };
    const offlineToken = signQr(qrPayload, "60m");

    const reservation = await prisma.reservation.create({
      data: {
        userId,
        timeslotId,
        stopId,
        status: ReservationStatus.CONFIRMED, // o PENDING si quieres flujo de pago
        offlineToken,
      },
      include: {
        timeslot: { select: { startAt: true, endAt: true, id: true, zoneId: true } },
        stop: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ reservation });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? "No se pudo crear la reserva" });
  }
});

reservationRouter.get("/reservations/me/reservations", requireAuth, async (req, res) => {
  const userId = (req as any).auth.sub as string;
  const now = new Date();

  const reservations = await prisma.reservation.findMany({
    where: { userId, timeslot: { startAt: { gte: now } } },
    orderBy: [{ timeslot: { startAt: "asc" } }, { createdAt: "desc" }],
    select: {
      id: true,
      status: true,
      offlineToken: true,
      createdAt: true,
      timeslot: {
        select: {
          id: true,
          startAt: true,
          endAt: true,
          zoneId: true,
          zone: { select: { name: true } },
        },
      },
      stop: { select: { id: true, name: true } },
    },
  });

  res.json({ reservations });
});


reservationRouter.post("/reservations/reservations/:id/cancel", requireAuth, async (req, res) => {
  const userId = (req as any).auth.sub as string;
  const { id } = req.params;

  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r || r.userId !== userId) {
    return res.status(404).json({ error: "Reserva no encontrada" });
  }


  const nonCancellable: ReservationStatus[] = [
    ReservationStatus.CANCELLED,
    ReservationStatus.NO_SHOW,
    ReservationStatus.BOARDED,
  ];

  if (nonCancellable.includes(r.status)) {
    return res.status(400).json({ error: "No se puede cancelar esta reserva" });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: ReservationStatus.CANCELLED },
  });

  res.json({ ok: true, reservation: updated });
});

reservationRouter.post("/reservations/quick", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub as string;
    const { routeId } = req.body ?? {};
    if (!routeId) return res.status(400).json({ error: "routeId requerido" });

    // 1) (Por ahora) usamos UNA zona “principal”
    const zone = await prisma.zone.findFirst({
      orderBy: { name: "asc" },
    });
    if (!zone) return res.status(409).json({ error: "No hay zonas configuradas" });

    // 2) Primer timeslot futuro de esa zona
    const now = new Date();
    const timeslot = await prisma.timeslot.findFirst({
      where: { zoneId: zone.id, startAt: { gt: now } },
      orderBy: { startAt: "asc" },
    });
    if (!timeslot) return res.status(409).json({ error: "No hay horarios próximos" });

    // 3) Primera parada de la zona
    const stop = await prisma.stop.findFirst({
      where: { zoneId: zone.id },
      orderBy: { name: "asc" },
    });
    if (!stop) return res.status(409).json({ error: "No hay paradas disponibles" });

    // 4) Capacidad simple: cuenta PENDING/CONFIRMED en el timeslot
    const activeCount = await prisma.reservation.count({
      where: { timeslotId: timeslot.id, status: { in: ["PENDING", "CONFIRMED"] } },
    });
    if (activeCount >= timeslot.capacity) {
      return res.status(409).json({ error: "Capacidad llena" });
    }

    // 5) Crea reserva CONFIRMED (igual que tu /reservations normal)
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        routeId,
        timeslotId: timeslot.id,
        stopId: stop.id,
        status: "CONFIRMED",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        timeslot: { select: { id: true, startAt: true, endAt: true } },
        stop: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ reservation });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? "No se pudo crear la reserva rápida" });
  }
});
