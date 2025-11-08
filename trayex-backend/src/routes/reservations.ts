// src/routes/reservations.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "./auth";
import { signQr } from "../services/jwt";
import { ReservationStatus } from "@prisma/client";

export const reservationRouter = Router();

/** Crear reserva real (timeslot + stop) */
reservationRouter.post("/reservations", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub as string;
    const { timeslotId, stopId } = req.body ?? {};
    if (!timeslotId || !stopId) {
      return res.status(400).json({ error: "timeslotId y stopId son requeridos" });
    }

    // Validar existencia
    const timeslot = await prisma.timeslot.findUnique({
      where: { id: timeslotId },
      select: { id: true, zoneId: true, capacity: true, startAt: true, endAt: true },
    });
    const stop = await prisma.stop.findUnique({
      where: { id: stopId },
      select: { id: true, name: true, zoneId: true },
    });

    if (!timeslot || !stop) {
      return res.status(404).json({ error: "Timeslot o Stop no encontrado" });
    }
    // Deben pertenecer a la misma zona (regla de negocio básica)
    if (timeslot.zoneId !== stop.zoneId) {
      return res.status(400).json({ error: "El timeslot y la parada deben pertenecer a la misma zona" });
    }

    // Capacidad: contar reservas activas (PENDING/CONFIRMED)
    const activeCount = await prisma.reservation.count({
      where: { timeslotId, status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] } },
    });
    if (activeCount >= timeslot.capacity) {
      return res.status(409).json({ error: "Capacidad llena" });
    }

    // QR offline (firma por 60 min -> 3600 segundos)
    const qrPayload = { uid: userId, ts: timeslotId, st: stopId };
    const offlineToken = signQr(qrPayload, 60 * 60);

    const reservation = await prisma.reservation.create({
      data: {
        userId,
        timeslotId,
        stopId,
        status: ReservationStatus.CONFIRMED, // o PENDING si quieres flujo de pago
        offlineToken,
      },
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

    return res.status(201).json({ reservation });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message ?? "No se pudo crear la reserva" });
  }
});

/** Mis reservas (hoy en adelante) */
reservationRouter.get("/me/reservations", requireAuth, async (req, res) => {
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
        select: { id: true, startAt: true, endAt: true, zoneId: true, zone: { select: { name: true } } },
      },
      stop: { select: { id: true, name: true } },
    },
  });

  return res.json({ reservations });
});

/** Cancelar reserva (propia) */
reservationRouter.post("/reservations/:id/cancel", requireAuth, async (req, res) => {
  const userId = (req as any).auth.sub as string;
  const { id } = req.params;

  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r || r.userId !== userId) return res.status(404).json({ error: "Reserva no encontrada" });

  if (
    r.status === ReservationStatus.CANCELLED ||
    r.status === ReservationStatus.NO_SHOW ||
    r.status === ReservationStatus.BOARDED
  ) {
    return res.status(400).json({ error: "No se puede cancelar esta reserva" });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: ReservationStatus.CANCELLED },
  });

  return res.json({ ok: true, reservation: updated });
});
