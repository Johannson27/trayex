// src/routes/auth.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { registerUser } from "../services/auth";
import { signSessionToken, verifySessionToken } from "../services/jwt";

const router = Router();

/** REGISTER */
router.post("/register", async (req, res) => {
  try {
    const {
      email = null,
      phone = null,
      password,
      fullName,
      bloodType,
      idNumber,
      university,
      emergencyName,
      emergencyContact,
    } = req.body ?? {};

    if (!password || String(password).length < 8) {
      return res.status(400).json({ error: "Password mínimo 8 caracteres" });
    }

    const out = await registerUser(
      email,
      phone,
      password,
      fullName,
      { bloodType, idNumber, university, emergencyName, emergencyContact }
    );

    return res.status(201).json(out);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Registration failed" });
  }
});

/** LOGIN (email + password) */
router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email y password son requeridos" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const cred = await prisma.passwordCredential.findUnique({ where: { userId: user.id } });
  if (!cred) return res.status(401).json({ error: "Credenciales inválidas" });

  const ok = await bcrypt.compare(password, cred.passwordHash);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  // Firma con helper (HS256, 7 días por defecto)
  const token = signSessionToken({ sub: user.id, role: user.role });
  return res.json({ token, user });
});

/** Middleware: Require Auth (Bearer) */
export function requireAuth(req: any, res: any, next: any) {
  try {
    const auth = req.header("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = verifySessionToken(token); // { sub, role }
    (req as any).auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/** ME (requiere Bearer token) */
router.get("/me", async (req, res) => {
  try {
    const auth = req.header("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = verifySessionToken<{ sub: string }>(token);
    const full = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { student: true },
    });
    if (!full) return res.status(401).json({ error: "Invalid token" });

    return res.json({
      user: {
        id: full.id,
        email: full.email,
        phone: full.phone,
        role: full.role,
        student: full.student ?? null,
      },
    });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

/** GET Perfil */
router.get("/me/profile", requireAuth, async (req, res) => {
  const { sub } = (req as any).auth as { sub: string };
  const user = await prisma.user.findUnique({
    where: { id: sub },
    select: { id: true, email: true, phone: true, role: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: sub },
    select: {
      fullName: true,
      bloodType: true,
      idNumber: true,
      university: true,
      emergencyName: true,
      emergencyContact: true,
    },
  });

  return res.json({ user, profile });
});

/** PUT Perfil */
router.put("/me/profile", requireAuth, async (req, res) => {
  const { sub } = (req as any).auth as { sub: string };
  const data = req.body || {};

  await prisma.studentProfile.upsert({
    where: { userId: sub },
    update: {
      fullName: data.fullName ?? undefined,
      bloodType: data.bloodType ?? undefined,
      idNumber: data.idNumber ?? undefined,
      university: data.university ?? undefined,
      emergencyName: data.emergencyName ?? undefined,
      emergencyContact: data.emergencyContact ?? undefined,
    },
    create: {
      userId: sub,
      fullName: data.fullName ?? null,
      bloodType: data.bloodType ?? null,
      idNumber: data.idNumber ?? null,
      university: data.university ?? null,
      emergencyName: data.emergencyName ?? null,
      emergencyContact: data.emergencyContact ?? null,
    },
  });

  const updated = await prisma.studentProfile.findUnique({
    where: { userId: sub },
    select: {
      fullName: true,
      bloodType: true,
      idNumber: true,
      university: true,
      emergencyName: true,
      emergencyContact: true,
    },
  });

  return res.json({ profile: updated });
});

// al final del archivo (o donde tengas el router)
router.post("/refresh", requireAuth, async (req, res) => {
  try {
    const { sub, role } = (req as any).auth || {};
    if (!sub) return res.status(401).json({ error: "Invalid token" });

    const fresh = signSessionToken({ sub, role }, 60 * 60 * 24 * 7); // 7 días
    return res.json({ token: fresh });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
