// src/index.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { prisma } from "./prisma";
import authRouter from "./routes/auth"; 
import { reservationRouter } from "./routes/reservations";
import routesRouter from "./routes/routes"; 
import { zonesRouter } from "./routes/zones";

const app = express();

app.use(cors());
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

app.use("/auth", authRouter);
app.use(routesRouter);        // p.ej. GET /routes
app.use(reservationRouter);   // POST /reservations, etc.
app.use(zonesRouter);

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
