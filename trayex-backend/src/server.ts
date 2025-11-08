// src/server.ts
import express from "express";
import cors from "cors";
import { prisma } from "./prisma";
import  authRouter  from "./routes/auth";
import { reservationRouter } from "./routes/reservations";
import { routesRouter } from "./routes/routes";

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRouter);
app.use(reservationRouter);
app.use(routesRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
