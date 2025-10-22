// src/routes/reservations.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "./auth";
import { signQr } from "../services/jwt"; // ya lo tienes en tus jwt services
import { ReservationStatus } from "@prisma/client";

export const reservationRouter = Router();

/** Crear reserva */
reservationRouter.post("/reservations", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub as string;
    const { timeslotId, stopId } = req.body ?? {};
    if (!timeslotId || !stopId) {
      return res.status(400).json({ error: "timeslotId y stopId son requeridos" });
    }

    // Validar stop/timeslot existen y pertenecen a misma zona
    const [timeslot, stop] = await Promise.all([
      prisma.timeslot.findUnique({ where: { id: timeslotId } }),
      prisma.stop.findUnique({ where: { id: stopId }, include: { zone: true } }),
    ]);
    if (!timeslot || !stop) return res.status(404).json({ error: "Timeslot o Stop no encontrado" });

    // Capacidad: contar reservas activas
    const activeCount = await prisma.reservation.count({
      where: { timeslotId, status: { in: ["PENDING", "CONFIRMED"] } },
    });
    if (activeCount >= timeslot.capacity) {
      return res.status(409).json({ error: "Capacidad llena" });
    }

    // Crear reserva + QR offline (simple)
    const qrPayload = { uid: userId, ts: timeslotId, st: stopId };
    const offlineToken = signQr(qrPayload, "60m"); // 1h

    const reservation = await prisma.reservation.create({
      data: {
        userId,
        timeslotId,
        stopId,
        status: ReservationStatus.CONFIRMED, // directo a CONFIRMED (puedes dejar PENDING si requieres pago)
        offlineToken,
      },
      include: {
        timeslot: { select: { startAt: true, endAt: true } },
        stop: { select: { name: true } },
      },
    });

    res.status(201).json({ reservation });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? "No se pudo crear la reserva" });
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
      timeslot: { select: { id: true, startAt: true, endAt: true, zoneId: true, zone: { select: { name: true } } } },
      stop: { select: { id: true, name: true } },
    },
  });

  res.json({ reservations });
});

/** Cancelar reserva */
reservationRouter.post("/reservations/:id/cancel", requireAuth, async (req, res) => {
  const userId = (req as any).auth.sub as string;
  const { id } = req.params;

  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r || r.userId !== userId) return res.status(404).json({ error: "Reserva no encontrada" });

  if (r.status === "CANCELLED" || r.status === "NO_SHOW" || r.status === "BOARDED") {
    return res.status(400).json({ error: "No se puede cancelar esta reserva" });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  res.json({ ok: true, reservation: updated });
});
