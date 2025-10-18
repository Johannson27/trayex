import { Router } from 'express';
export const catalogRouter = Router();

// Zonas, paradas, franjas (mocks)
catalogRouter.get('/zones', (_req, res) => {
  res.json([{ id: 'z1', name: 'Camino Real', polygon: {}, serviceHours: '06:00-22:00' }]);
});

catalogRouter.get('/stops', (req, res) => {
  const { zone } = req.query;
  res.json([{ id: 's1', zoneId: zone || 'z1', name: 'Parada A', lat: 12.12, lng: -86.25, isSafe: true }]);
});

catalogRouter.get('/timeslots', (req, res) => {
  const { zone, date } = req.query;
  res.json([
    { id: 't1', zoneId: zone || 'z1', startAt: `${date||'2025-01-01'}T07:00:00Z`, endAt: `${date||'2025-01-01'}T07:30:00Z`, capacity: 40 }
  ]);
});
