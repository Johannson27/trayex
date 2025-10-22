import { Router } from "express";
import { registerUser, validateUser } from "../services/auth";
import { verifySessionToken } from "../services/jwt";
import { prisma } from "../prisma";

const router = Router();

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


/** LOGIN (email o phone + password) */
router.post("/login", async (req, res) => {
  try {
    const { email, phone, password } = req.body ?? {};
    if (!password) return res.status(400).json({ error: "Password requerido" });
    const out = await validateUser({ email, phone }, password);
    return res.json(out);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Login failed" });
  }
});

/** ME (requiere Bearer token de sesión) */
router.get("/me", async (req, res) => {
  try {
    const auth = req.header("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = verifySessionToken(token); // { sub, role, ... }
    const full = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      include: { student: true }, //  incluye perfil
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

// GET perfil
router.get("/me/profile", requireAuth, async (req, res) => {
  const { sub } = (req as any).auth;
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

// PUT perfil
router.put("/me/profile", requireAuth, async (req, res) => {
  const { sub } = (req as any).auth;
  const data = req.body || {};

  // asegura que exista profile
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

export default router;
