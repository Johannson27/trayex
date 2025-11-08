// backend/src/config.ts
import "dotenv/config";

export const JWT_SECRET = process.env.JWT_SECRET || "dev-super-secret-change-me";

export const QR_JWT_KEYS = (process.env.QR_JWT_KEYS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

// si no hay claves QR, usa el mismo secret del login
export const QR_CURRENT_KEY = QR_JWT_KEYS[0] || JWT_SECRET;

export const CORS_ORIGINS = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

export const PORT = Number(process.env.PORT || 4000);
