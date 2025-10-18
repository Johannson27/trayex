// src/services/jwt.ts
import * as jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions, Secret } from "jsonwebtoken";

/* =======================
 *  SESSION TOKENS (login)
 * ======================= */

type SessionPayload = {
  sub: string;
  role: string;
};

const SESSION_SECRET: Secret = (() => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("Missing JWT_SECRET");
  return s as Secret;
})();

export function signSessionToken(
  payload: SessionPayload,
  opts: SignOptions = {}
): string {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: 60 * 60 * 24 * 7, // 7 días en segundos
    ...opts,
  };
  // 👇 Al usar namespace import y Secret garantizado, TS elige la sobrecarga correcta
  return jwt.sign(payload, SESSION_SECRET, options);
}

export function verifySessionToken(token: string): SessionPayload & JwtPayload {
  const decoded = jwt.verify(token, SESSION_SECRET);
  if (typeof decoded === "string" || !decoded || typeof (decoded as any).sub !== "string") {
    throw new Error("Invalid session token (payload)");
  }
  if (typeof (decoded as any).role !== "string") {
    throw new Error("Invalid session token (role)");
  }
  return decoded as SessionPayload & JwtPayload;
}

/* =======================
 *  QR TOKENS (rotación)
 * ======================= */

function getQrKeys(): string[] {
  const raw = (process.env.QR_JWT_KEYS || "dev")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return raw.length ? raw : ["dev"];
}

function getQrSecretByIndex(idx: number): Secret {
  const arr = getQrKeys();
  const s = arr[idx];
  if (!s) throw new Error("QR key index out of range");
  return s as Secret;
}

function kidForIndex(i: number) {
  return `k${i}`; // k0 = la más nueva
}

export function signQr(payload: object, expiresIn = "15m"): string {
  const latest = getQrSecretByIndex(0);
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: typeof expiresIn === "number" ? expiresIn : 15 * 60, 
    header: { alg: "HS256", kid: kidForIndex(0) },

  };
  return jwt.sign(payload as any, latest, options);
}

export function verifyQr(token: string): JwtPayload | string {
  try {
    const decodedAny = jwt.decode(token, { complete: true }) as any;
    const kid: string | undefined = decodedAny?.header?.kid;
    if (kid && /^k\d+$/.test(kid)) {
      const idx = Number(kid.slice(1));
      const secret = getQrSecretByIndex(idx);
      return jwt.verify(token, secret);
    }
  } catch {
    // sigue al fallback
  }

  const keys = getQrKeys();
  for (let i = 0; i < keys.length; i++) {
    try {
      return jwt.verify(token, getQrSecretByIndex(i));
    } catch {
      /* try next */
    }
  }
  throw new Error("Invalid QR token");
}
