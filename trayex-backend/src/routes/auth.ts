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


export default router;
