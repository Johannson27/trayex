export async function fetchNotifications(token: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/notifications`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Error al obtener notificaciones");

    return res.json();
}

export async function markNotificationAsRead(id: string, token: string) {
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function markAllNotificationsRead(token: string) {
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
