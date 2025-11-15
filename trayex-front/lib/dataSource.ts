// src/lib/dataSource.ts

// ---------------- TIPOS ----------------

export type StopRow = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    isSafe: boolean;
};

export type RouteRow = {
    id: string;
    name: string;
    description: string | null;

    mainStops: string[];
    status: "ACTIVE" | "SAFE" | "INCIDENT";
    estimatedTime: string;
    capacity: string;
    isFavorite: boolean;

    // Nuevos
    stops?: StopRow[];                     // Paradas asociadas a la ruta
    shape?: { lat: number; lng: number }[]; // Shape real para polilínea
};

// ---------------- CONFIG ----------------

const SOURCE = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "osm").toLowerCase();
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ---------------- HELPERS ----------------

function sanitizeShape(shape: any[]): { lat: number; lng: number }[] {
    if (!Array.isArray(shape)) return [];
    return shape
        .map((p) => ({
            lat: Number(p.lat),
            lng: Number(p.lng),
        }))
        .filter((p) => !isNaN(p.lat) && !isNaN(p.lng));
}

function sanitizeStops(list: any[]): StopRow[] {
    return list.map((s) => ({
        id: String(s.id ?? s.osm_id ?? cryptoRandomId()),
        name: String(s.name ?? s.ref ?? "Parada"),
        lat: Number(s.lat),
        lng: Number(s.lng),
        isSafe: Boolean(s.isSafe ?? true),
    }));
}

// Util para IDs cuando falten
function cryptoRandomId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return (crypto as any).randomUUID();
    }
    return Math.random().toString(36).slice(2);
}

// ---------------- STOPS ----------------

export async function dsFetchStops(): Promise<StopRow[]> {
    if (SOURCE === "osm") {
        const res = await fetch("/data/managua-stops.json", { cache: "no-store" });
        if (!res.ok) return [];
        const data = await res.json();
        return sanitizeStops(data?.stops ?? []);
    }

    if (SOURCE === "api") {
        const res = await fetch(`${API_URL}/stops`, { cache: "no-store" });
        if (!res.ok) return [];
        const data = await res.json();
        return sanitizeStops(data?.stops ?? []);
    }

    return [];
}

// ---------------- ROUTES ----------------

export async function dsFetchRoutes(): Promise<RouteRow[]> {
    if (SOURCE === "osm") {
        const res = await fetch("/data/managua-routes.json", { cache: "no-store" });
        if (!res.ok) return [];
        const raw = await res.json();

        const list = Array.isArray(raw) ? raw : raw.routes ?? [];

        return list.map((r: any): RouteRow => ({
            id: String(r.id),
            name: r.name ?? "Ruta sin nombre",
            description: r.description ?? null,

            mainStops: r.mainStops ?? [],
            status: (r.status as any) ?? "ACTIVE",
            estimatedTime: String(r.estimatedTime ?? "—"),
            capacity: String(r.capacity ?? "—"),
            isFavorite: Boolean(r.isFavorite ?? false),

            // Si algún día tus JSON incluyen esto:
            stops: Array.isArray(r.stops) ? sanitizeStops(r.stops) : undefined,
            shape: Array.isArray(r.shape) ? sanitizeShape(r.shape) : undefined,
        }));
    }

    if (SOURCE === "api") {
        const res = await fetch(`${API_URL}/routes`, { cache: "no-store" });
        if (!res.ok) return [];
        const list = await res.json();

        return (list ?? []).map((r: any): RouteRow => ({
            id: String(r.id),
            name: r.name,
            description: r.description ?? null,

            mainStops: r.mainStops ?? [],
            status: (r.status as any) ?? "ACTIVE",
            estimatedTime: String(r.estimatedTime ?? "—"),
            capacity: String(r.capacity ?? "—"),
            isFavorite: Boolean(r.isFavorite ?? false),

            stops: Array.isArray(r.stops) ? sanitizeStops(r.stops) : undefined,
            shape: Array.isArray(r.shape) ? sanitizeShape(r.shape) : undefined,
        }));
    }

    return [];
}
