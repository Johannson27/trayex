import { Router } from 'express';
import { idempotency } from '../middleware/idempotency';
export const reservationRouter = Router();

reservationRouter.post('/reservations', idempotency, (req, res) => {
  const { timeslotId, stopId } = req.body || {};
  if (!timeslotId || !stopId) return res.status(400).json({ title: 'Bad Request', status: 400, detail: 'timeslotId and stopId are required' });
  const reservation = {
    id: 'r1',
    timeslotId, stopId,
    status: 'CONFIRMED',
    qrCode: 'QR_PAYLOAD',
    offlineToken: 'jwt.offline.token'
  };
  res.status(201).json(reservation);
});

reservationRouter.get('/reservations/me', (_req, res) => {
  res.json([{ id: 'r1', status: 'CONFIRMED' }]);
});
