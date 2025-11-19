export async function subscribeToPush() {
    if (typeof window === "undefined") return;

    // Esperar a que el service worker esté listo
    const registration = await navigator.serviceWorker.ready;

    const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC!
        ),
    });

    // Mandarla al backend
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/push/subscribe`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(sub),
    });

    return sub;
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}


