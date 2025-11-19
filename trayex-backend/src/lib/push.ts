// Notificaciones deshabilitadas temporalmente.

export async function saveSubscription(sub: any, userId: any) {
    console.log("saveSubscription() llamado, pero push está deshabilitado.");
    return;
}

export async function sendPushToAll(data: { title: string; body: string }) {
    console.log("sendPushToAll() llamado, pero push está deshabilitado.");
    return;
}
