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
export async function dsFetchRoutes(): Promise<RouteRow[]> {
    if (SOURCE === "osm") {
        const res = await fetch("/data/managua-routes.json", { cache: "no-store" });
        if (!res.ok) return [];
        const data = await res.json();
        // Esperamos { routes: Array<OSMRoute> }
        const routes: RouteRow[] = (data?.routes ?? []).map((r: any, idx: number) => {
            // Intenta obtener una lista de paradas legibles
            const mainStops: string[] =
                r?.stops?.map((s: any) => s?.name).filter(Boolean) ??
                r?.properties?.stops?.map((s: any) => s?.name).filter(Boolean) ??
                [];

            return {
                id: String(r.id ?? r.ref ?? `route_${idx}`),
                name: String(r.name ?? r.properties?.name ?? r.ref ?? `Ruta ${idx + 1}`),
                description:
                    r.properties?.description ??
                    r.properties?.operator ??
                    null,
                mainStops: mainStops.slice(0, 6), // muestra algunas
                status: "ACTIVE",
                estimatedTime:
                    r.properties?.duration ??
                    r.properties?.expected_travel_time ??
                    "—",
                capacity: r.properties?.capacity ? String(r.properties.capacity) : "—",
                isFavorite: false,
            };
        });
        return routes;
    }

    if (SOURCE === "api" && API_URL) {
        const res = await fetch(`${API_URL}/routes`, { cache: "no-store" });
        if (!res.ok) return [];
        // Tu backend ya devuelve { routes: RouteRow[] }
        const data = await res.json();
        return data?.routes ?? [];
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
