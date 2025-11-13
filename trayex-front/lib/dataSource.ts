// src/lib/dataSource.ts

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
};

const SOURCE = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "api").toLowerCase();
const API_URL = process.env.NEXT_PUBLIC_API_URL; // solo se usa si SOURCE === 'api'

// ---------- STOPS ----------
export async function dsFetchStops(): Promise<StopRow[]> {
    if (SOURCE === "osm") {
        // Tus archivos generados por el script
        const res = await fetch("/data/managua-stops.json", { cache: "no-store" });
        if (!res.ok) return [];
        const data = await res.json();
        // Esperamos { stops: Array<{id,name,lat,lng,isSafe?}> }
        const stops: StopRow[] = (data?.stops ?? []).map((s: any) => ({
            id: String(s.id ?? s.osm_id ?? cryptoRandomId()),
            name: String(s.name ?? s.ref ?? "Parada"),
            lat: Number(s.lat),
            lng: Number(s.lng),
            isSafe: Boolean(s.isSafe ?? true),
        }));
        return stops;
    }

    // API (ajusta la ruta si tu backend expone otra)
    if (SOURCE === "api" && API_URL) {
        const res = await fetch(`${API_URL}/stops`, { cache: "no-store" });
        if (!res.ok) return [];
        const data = await res.json();
        return (data?.stops ?? []) as StopRow[];
    }

    return [];
}

// ---------- ROUTES ----------
export async function dsFetchRoutes() {
    const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "osm";

    if (source === "osm") {
        const res = await fetch("/data/managua-routes.json");
        const data = await res.json();
        if (Array.isArray(data)) return data;
        return data.routes ?? [];
    }

    if (source === "api") {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/routes`);
        return await res.json();
    }

    return [];
}


// Util para IDs cuando falten
function cryptoRandomId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return (crypto as any).randomUUID();
    }
    return Math.random().toString(36).slice(2);
}
