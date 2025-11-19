import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";  // ✔ Este sí existe

const prisma = new PrismaClient();
const router = Router();

// Obtener saldo del usuario
router.get("/balance", requireAuth, async (req: any, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { balance: true }
        });

        return res.json({ balance: user?.balance ?? 0 });
    } catch (error) {
        return res.status(500).json({ error: "Error obteniendo saldo" });
    }
});

// Recargar saldo
router.post("/balance/add", requireAuth, async (req: any, res) => {
    const { amount } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { balance: { increment: amount } },
            select: { balance: true }
        });

        return res.json({ balance: user.balance });
    } catch (error) {
        return res.status(500).json({ error: "Error recargando saldo" });
    }
});

export default router;
