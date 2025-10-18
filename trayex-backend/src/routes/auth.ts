import { Router } from "express";
import { registerUser, validateUser } from "../services/auth";
import { verifySessionToken } from "../services/jwt";

const router = Router();

/** REGISTER (email o phone + password) */
router.post("/register", async (req, res) => {
  try {
    const { email = null, phone = null, password } = req.body ?? {};
    if (!password || String(password).length < 8) {
      return res.status(400).json({ error: "Password mínimo 8 caracteres" });
    }
    const out = await registerUser(email, phone, password);
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
router.get("/me", (req, res) => {
  try {
    const auth = req.header("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = verifySessionToken(token); // { sub, role, iat, exp }
    return res.json({ user: { id: payload.sub, role: payload.role } });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
