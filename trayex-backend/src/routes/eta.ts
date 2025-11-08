import { Router } from 'express';
export const etaRouter = Router();

// Estimación muy básica (mock)
etaRouter.get('/eta', (req, res) => {
  const { timeslotId } = req.query;
  res.json({ timeslotId, etaMinutes: 8 });
});
