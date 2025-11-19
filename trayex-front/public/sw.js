self.addEventListener("install", () => {
    console.log("SW installed");
});

self.addEventListener("activate", () => {
    console.log("SW activated");
});

// WEB PUSH
self.addEventListener("push", (event) => {
    const data = event.data?.json() || {};

    event.waitUntil(
        self.registration.showNotification(data.title || "Trayex", {
            body: data.body || "",
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-192.png",
            data: data,
        })
    );
});

self.addEventListener("push", event => {
    if (!event.data) return;

    const payload = event.data.json();

    const options = {
        body: payload.body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: payload,
    };

    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

self.addEventListener("notificationclick", event => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow("/alerts") // donde está tu pantalla de notificaciones
    );
});
