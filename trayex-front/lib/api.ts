// frontend/src/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
const JSON_HEADERS = { "Content-Type": "application/json" };

async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const url = `${BASE}${path}`;
    const res = await fetch(url, opts);
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
    return api<{ token: string; user?: any }>("/auth/login", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, password }),
    });
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
    return api<{ token: string; user?: any }>("/auth/register", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
            email,
            password,
            fullName,
            ...(profile ?? {}),
        }),
    });
}

export async function getMe(token: string) {
    return api<{ user: any }>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
    });
}

// -------- PROFILE --------
export async function getMyProfile(token: string) {
    return api<{ user: any; profile: any | null }>("/auth/me/profile", {
        headers: { Authorization: `Bearer ${token}` },
    });
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
        headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
}

// -------- PASS / QR --------
export async function getPassQR(token: string) {
    return api<{ qr: string }>("/pass/qr", {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function rotatePassQR(token: string) {
    return api<{ qr: string }>("/pass/qr/rotate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
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
    }>("/me/reservations", {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function cancelReservation(token: string, reservationId: string) {
    return api<{ ok: boolean; reservation: any }>(`/reservations/${reservationId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

/** Crear reserva REAL (con timeslot/stop) -> POST /reservations */
export async function createReservation(
    token: string,
    params: { timeslotId: string; stopId: string }
) {
    return api<{ reservation: any }>(`/reservations`, {
        method: "POST",
        headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify(params),
    });
}

/** Reserva rápida por ruta -> POST /reservations/quick */
export async function createQuickReservation(token: string, routeId: string) {
    return api<{ reservation: any }>(`/reservations/quick`, {
        method: "POST",
        headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ routeId }),
    });
}
