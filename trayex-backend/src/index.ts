// src/index.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { prisma } from "./prisma";

import authRouter from "./routes/auth"; 
import  passRouter  from "./routes/pass";            // <= FALTABAAAA
import { reservationRouter } from "./routes/reservations";
import routesRouter from "./routes/routes";
import { zonesRouter } from "./routes/zones";
import { notificationsRouter } from "./routes/notifications";

const app = express();

app.use(cors());               // si quieres, config: cors({ origin: "http://localhost:3000", credentials: true })
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

// Routers
app.use("/auth", authRouter);  // /auth/...
app.use(passRouter);           // /pass/qr, /pass/qr/rotate
app.use(routesRouter);         // /routes
app.use(reservationRouter);    // /reservations, /me/reservations (según lo tengas)
app.use(zonesRouter);          // /zones, /zones/:id/stops, /zones/:id/timeslots
app.use(notificationsRouter);  // /me/notifications, /notifications/:id/read, etc.

app.get("/health", (_req, res) => res.status(200).send("ok"));


app.use(cors({
  origin: ["http://localhost:3000", "https://trayex.vercel.app"],
  credentials: true
}));
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// Shutdown ordenado
const shutdown = async () => {
  console.log("Shutting down...");
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
