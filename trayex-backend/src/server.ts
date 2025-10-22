import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";                // <-- tu router actual de auth
import { reservationRouter } from "./routes/reservations"; // <-- el que pegaste

const app = express();
app.use(cors());
app.use(express.json());

// monta routers
app.use("/", authRouter);
app.use("/", reservationRouter);

// health
app.get("/healthz", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
