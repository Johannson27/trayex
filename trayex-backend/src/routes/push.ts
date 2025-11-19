import { Router } from "express";

export const pushRouter = Router();

// ENDPOINT DE SUSCRIPCIÓN (DESHABILITADO)
pushRouter.post("/subscribe", async (req, res) => {
    console.log("Suscripción recibida pero PUSH está deshabilitado.");
    res.json({ ok: true, disabled: true });
});

// ENDPOINT DE ENVÍO DE PUSH (DESHABILITADO)
pushRouter.post("/send", async (req, res) => {
    console.log("Intento de enviar PUSH pero está deshabilitado.");
    res.json({ ok: true, disabled: true });
});
