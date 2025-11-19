import express from "express";
import cors from "cors";
import morgan from "morgan";
import { prisma } from "./prisma";

import { pushRouter } from "./routes/push";
import authRouter from "./routes/auth";
import passRouter from "./routes/pass";
import { reservationRouter } from "./routes/reservations";
import routesRouter from "./routes/routes";
import { zonesRouter } from "./routes/zones";
import { notificationsRouter } from "./routes/notifications";

const app = express();

// CORS CORRECTO
app.use(cors({
  origin: ["http://localhost:3000", "https://trayex.vercel.app"],
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

// Routers
app.use("/auth", authRouter);
app.use(passRouter);
app.use(routesRouter);
app.use(reservationRouter);
app.use(zonesRouter);
app.use(notificationsRouter);
app.use("/push", pushRouter);

// Ping
app.get("/ping", (req, res) => {
  res.json({ ok: true, msg: "Servidor funcionando!" });
});

// Start server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});

// Shutdown ordenado
const shutdown = async () => {
  console.log("Shutting down...");
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
