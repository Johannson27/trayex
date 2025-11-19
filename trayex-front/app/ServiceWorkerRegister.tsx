"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
    useEffect(() => {
        // Registrar el SW
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch(() => { });
        }

        // Suscribir al usuario a push notifications
        import("@/lib/push-client").then((m) => {
            m.subscribeUser().catch(() => { });
        });
    }, []);

    return null;
}
