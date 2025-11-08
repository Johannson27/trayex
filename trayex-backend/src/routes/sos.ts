import { Router } from 'express';
import { io } from '../ws';

export const sosRouter = Router();

sosRouter.post('/sos', (req, res) => {
  const { lat, lng } = req.body || {};
  const sosId = `sos_${Date.now()}`;
  // Notificar a monitores en canal global y cuarto dedicado
  io().to('monitors').emit('sos:new', { id: sosId, lat, lng, ts: Date.now() });
  res.status(201).json({ id: sosId, status: 'OPEN' });
});
