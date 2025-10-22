// frontend/src/lib/api.ts
// (si tu carpeta es distinta, ajusta la ruta)

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
const JSON_HEADERS = { "Content-Type": "application/json" };

// -------- helper --------
async function api<T>(
    path: string,
    opts: RequestInit = {}
): Promise<T> {
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
    }>("/reservations/me/reservations", {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function cancelReservation(token: string, reservationId: string) {
    return api<{ ok: boolean; reservation: any }>(
        `/reservations/reservations/${reservationId}/cancel`,
        {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        }
    );
}

// ===== RUTAS =====
export async function fetchRoutes() {
    // intenta pedir al backend /routes, si falla devolvemos un mock para que la UI no muera
    const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
    try {
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
            }>
        };
    } catch {
        // fallback mock
        return {
            routes: [
                {
                    id: "1",
                    name: "Ruta 1 - Norte",
                    description: "Campus Central → Zona Industrial",
                    mainStops: ["Campus Central", "Av. Principal", "Centro Comercial", "Zona Industrial"],
                    status: "ACTIVE" as const,
                    estimatedTime: "15 min",
                    capacity: "12/40",
                    isFavorite: false,
                },
                {
                    id: "2",
                    name: "Ruta 2 - Sur",
                    description: "Campus Central → Residencias",
                    mainStops: ["Campus Central", "Hospital", "Plaza Mayor", "Residencias"],
                    status: "SAFE" as const,
                    estimatedTime: "20 min",
                    capacity: "8/40",
                    isFavorite: true,
                },
                {
                    id: "3",
                    name: "Ruta 3 - Este",
                    description: "Campus Central → Parque Tecnológico",
                    mainStops: ["Campus Central", "Biblioteca", "Estadio", "Parque Tecnológico"],
                    status: "INCIDENT" as const,
                    estimatedTime: "25 min",
                    capacity: "35/40",
                    isFavorite: false,
                },
            ],
        };
    }
}

// Reserva rápida por ruta (demo). Si aún no tienes endpoint en backend, devolverá ok:true
export async function createReservation(token: string, routeId: string) {
    const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
    try {
        // Opción 1 (si creas este endpoint en tu backend):
        const res = await fetch(`${BASE}/reservations/quick`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ routeId }),
        });
        if (!res.ok) throw new Error((await res.json())?.error ?? `HTTP ${res.status}`);
        return await res.json(); // { reservation: {...} }
    } catch {
        // Opción 2 (fallback local para no romper la UI mientras no existe el endpoint)
        return { ok: true };
    }
}

