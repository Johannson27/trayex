// src/lib/api.ts
import { getToken, saveToken, clearToken } from "@/lib/session";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const JSON_HEADERS = { "Content-Type": "application/json" };

function authHeaders(token?: string): Record<string, string> {
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- refresh del token ---
async function refreshSession(oldToken: string): Promise<string | null> {
    try {
        const res = await fetch(`${BASE}/auth/refresh`, {
            method: "POST",
            headers: { ...authHeaders(oldToken) },
        });
        if (!res.ok) return null;
        const data = await res.json();
        const newToken = data?.token as string | undefined;
        if (newToken) {
            saveToken(newToken);
            return newToken;
        }
        return null;
    } catch {
        return null;
    }
}

// --- wrapper con retry (401 -> refresh -> retry 1 vez) ---
async function api<T>(path: string, opts: RequestInit = {}, retry = true): Promise<T> {
    const token = getToken();
    const res = await fetch(`${BASE}${path}`, {
        ...opts,
        headers: {
            ...(opts.headers || {}),
            ...authHeaders(token || undefined),
        } as Record<string, string>,
    });

    if (res.status === 401 && token && retry) {
        // intentamos refrescar
        const newToken = await refreshSession(token);
        if (newToken) {
            // reintenta la solicitud original, ahora con el token nuevo
            const res2 = await fetch(`${BASE}${path}`, {
                ...opts,
                headers: {
                    ...(opts.headers || {}),
                    ...authHeaders(newToken),
                } as Record<string, string>,
            });
            if (!res2.ok) {
                let msg = `HTTP ${res2.status}`;
                try { const j = await res2.json(); if (j?.error) msg = j.error; } catch { }
                throw new Error(msg);
            }
            return (await res2.json()) as T;
        } else {
            // refresh falló: forzamos logout “silencioso”
            clearToken();
        }
    }

    if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
            const j = await res.json();
            if (j?.error) msg = j.error;
        } catch { }
        throw new Error(msg);
    }

    return (await res.json()) as T;
}

// -------- AUTH --------
export async function login(email: string, password: string) {
    const out = await api<{ token: string; user?: any }>("/auth/login", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, password }),
    }, /*retry*/ false); // login no intenta refresh
    if (out?.token) saveToken(out.token);
    return out;
}

export async function register(
    email: string,
    password: string,
    fullName: string,
    profile?: {
        bloodType?: string | null;
        idNumber?: string | null;
        university?: string | null;
        emergencyName?: string | null;
        emergencyContact?: string | null;
    }
) {
    const out = await api<{ token: string; user?: any }>("/auth/register", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, password, fullName, ...(profile ?? {}) }),
    }, false);
    if (out?.token) saveToken(out.token);
    return out;
}

export async function getMe(token: string) {
    return api<{ user: any }>("/auth/me");
}

// -------- PROFILE --------
export async function getMyProfile(token: string) {
    return api<{ user: any; profile: any | null }>("/auth/me/profile");
}

export async function updateMyProfile(
    token: string,
    data: {
        fullName?: string;
        bloodType?: string;
        idNumber?: string;
        university?: string;
        emergencyName?: string;
        emergencyContact?: string;
    }
) {
    return api<{ profile: any }>("/auth/me/profile", {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify(data),
    });
}

// -------- PASS / QR --------
export async function getPassQR(token: string) {
    return api<{ qr: string }>("/pass/qr");
}

export async function rotatePassQR(token: string) {
    return api<{ qr: string }>("/pass/qr/rotate", { method: "POST" });
}

// ===== RUTAS =====
export async function fetchRoutes() {
    const res = await fetch(`${BASE}/routes`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as {
        routes: Array<{
            id: string;
            name: string;
            description: string | null;
            mainStops: string[];
            status: "ACTIVE" | "SAFE" | "INCIDENT";
            estimatedTime: string;
            capacity: string;
            isFavorite: boolean;
        }>;
    };
}

// ===== ZONAS / STOPS / TIMESLOTS =====
export async function listZones() {
    return api<{ zones: Array<{ id: string; name: string }> }>("/zones");
}
export async function listStops(zoneId: string) {
    return api<{ stops: Array<{ id: string; name: string; lat: number; lng: number; isSafe: boolean }> }>(
        `/zones/${zoneId}/stops`
    );
}
export async function listTimeslots(zoneId: string, fromISO?: string, limit = 6) {
    const p = new URLSearchParams();
    if (fromISO) p.set("from", fromISO);
    if (limit) p.set("limit", String(limit));
    const qs = p.toString() ? `?${p.toString()}` : "";
    return api<{ timeslots: Array<{ id: string; startAt: string; endAt: string; capacity: number }> }>(
        `/zones/${zoneId}/timeslots${qs}`
    );
}

// -------- RESERVATIONS --------
export async function getMyReservations(token: string) {
    return api<{
        reservations: Array<{
            id: string;
            status: string;
            offlineToken?: string | null;
            createdAt: string;
            timeslot: {
                id: string;
                startAt: string;
                endAt: string;
                zoneId: string;
                zone: { name: string };
            };
            stop: { id: string; name: string };
        }>;
    }>("/me/reservations");
}

export async function cancelReservation(token: string, reservationId: string) {
    return api<{ ok: boolean; reservation: any }>(`/reservations/${reservationId}/cancel`, {
        method: "POST",
    });
}

/** Crear reserva REAL (con timeslot/stop) -> POST /reservations */
export async function createReservation(
    token: string,
    params: { timeslotId: string; stopId: string }
) {
    return api<{ reservation: any }>(`/reservations`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(params),
    });
}

/** Reserva rápida por ruta -> POST /reservations/quick */
export async function createQuickReservation(token: string, routeId: string) {
    return api<{ reservation: any }>(`/reservations/quick`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ routeId }),
    });
}

// --- NOTIFICATIONS ---
export type UiNotification = {
    id: string;
    title: string;
    body: string;
    channel: string;
    sentAt: string | null;
    read: boolean;
};

export async function getMyNotifications(token: string) {
    return api<{ notifications: UiNotification[] }>("/me/notifications");
}
export async function markNotificationRead(token: string, id: string) {
    return api<{ ok: boolean }>(`/notifications/${id}/read`, { method: "POST" });
}
export async function markAllNotificationsRead(token: string) {
    return api<{ ok: boolean }>(`/notifications/read-all`, { method: "POST" });
}
