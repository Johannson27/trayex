import { Router } from 'express';
import { signQr, verifyQr } from '../services/jwt';

export const ticketRouter = Router();

ticketRouter.get('/tickets/:reservationId/qr', (req, res) => {
  const { reservationId } = req.params;
  const token = signQr({ rid: reservationId, typ: 'BOARDING' }, '10m');
  res.json({ reservationId, qr: token });
});

// Validador (conductor) offline/online — aquí sólo verificación server-side
ticketRouter.post('/validate', (req, res) => {
  const { qr } = req.body || {};
  try {
    const decoded = verifyQr(qr);
    res.json({ ok: true, decoded });
  } catch {
    res.status(400).json({ ok: false, reason: 'INVALID_QR' });
  }
});
