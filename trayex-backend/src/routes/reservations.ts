import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "./auth";
import { signQr } from "../services/jwt";

export const reservationRouter = Router();

/**
 * 🚀 Crear reserva
 */
reservationRouter.post("/reservations", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub as string;
    const { timeslotId, stopId } = req.body ?? {};

    if (!timeslotId || !stopId) {
      return res.status(400).json({ error: "timeslotId y stopId son requeridos" });
    }

    // 1️⃣ Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // 2️⃣ Validar saldo
    if (user.balance < 20) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    // 3️⃣ Validar timeslot
    const timeslot = await prisma.timeslot.findUnique({
      where: { id: timeslotId },
      select: { id: true, zoneId: true, capacity: true },
    });

    if (!timeslot) {
      return res.status(404).json({ error: "Timeslot no encontrado" });
    }

    // 4️⃣ Validar stop
    const stop = await prisma.stop.findUnique({
      where: { id: stopId },
      select: { id: true, zoneId: true },
    });

    if (!stop) {
      return res.status(404).json({ error: "Parada no encontrada" });
    }

    // 5️⃣ Validar que ambos sean de la misma zona
    if (timeslot.zoneId !== stop.zoneId) {
      return res.status(400).json({ error: "Timeslot y parada deben ser de la misma zona" });
    }

    // 6️⃣ Validar capacidad
    const activeCount = await prisma.reservation.count({
      where: {
        timeslotId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (activeCount >= timeslot.capacity) {
      return res.status(409).json({ error: "Capacidad llena" });
    }

    // 7️⃣ Crear QR offline
    const offlineToken = signQr({ uid: userId, ts: timeslotId, st: stopId }, 3600);

    // 8️⃣ Crear la reserva
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        timeslotId,
        stopId,
        status: "CONFIRMED",
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
            zone: { select: { name: true } },
          },
        },
        stop: {
          select: { id: true, name: true },
        },
      },
    });

    // 9️⃣ Restar saldo al usuario
    await prisma.user.update({
      where: { id: userId },
      data: { balance: { decrement: 20 } },
    });

    return res.status(201).json({ reservation });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "No se pudo crear la reserva" });
  }
});

/**
 * 📌 Obtener mis reservas futuras
 */
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
        select: {
          id: true,
          startAt: true,
          endAt: true,
          zone: { select: { name: true } },
        },
      },
      stop: { select: { id: true, name: true } },
    },
  });

  return res.json({ reservations });
});

/**
 * ❌ Cancelar reserva
 */
reservationRouter.post("/reservations/:id/cancel", requireAuth, async (req, res) => {
  const userId = (req as any).auth.sub as string;
  const { id } = req.params;

  const r = await prisma.reservation.findUnique({ where: { id } });

  if (!r || r.userId !== userId) {
    return res.status(404).json({ error: "Reserva no encontrada" });
  }

  if (["CANCELLED", "NO_SHOW", "BOARDED"].includes(r.status)) {
    return res.status(400).json({ error: "No se puede cancelar esta reserva" });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return res.json({ ok: true, reservation: updated });
});
