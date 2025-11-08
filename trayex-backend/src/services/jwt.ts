// backend/src/services/jwt.ts
import jwt from "jsonwebtoken";
import { JWT_SECRET, QR_JWT_KEYS, QR_CURRENT_KEY } from "../config";

/** ===== Sesión (login) ===== */
export function signSessionToken(payload: object, expiresSeconds = 60 * 60 * 24 * 7) {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: expiresSeconds,
  });
}

export function verifySessionToken<T = any>(token: string): T {
  return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as T;
}

/** ===== QR ===== */
export function signQr(payload: object, expiresSeconds = 60 * 15) {
  return jwt.sign(payload, QR_CURRENT_KEY, {
    algorithm: "HS256",
    expiresIn: expiresSeconds,
  });
}

export function verifyQr<T = any>(token: string): T {
  const keys = QR_JWT_KEYS.length ? QR_JWT_KEYS : [QR_CURRENT_KEY];
  let lastErr: unknown;
  for (const key of keys) {
    try {
      return jwt.verify(token, key, { algorithms: ["HS256"] }) as T;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Invalid QR token");
}
