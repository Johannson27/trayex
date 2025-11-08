import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

// Minimal idempotency guard (memory). For production, use Redis.
const seen = new Map<string, number>();

export function idempotency(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['idempotency-key'] as string | undefined;
  if (!key) return next();
  const signature = createHash('sha1').update(key).digest('hex');
  if (seen.has(signature)) {
    return res.status(409).json({ title: 'Conflict', status: 409, detail: 'Duplicate request' });
  }
  seen.set(signature, Date.now());
  next();
}
