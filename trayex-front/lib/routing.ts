import { dsFetchStops, dsFetchRoutes } from "@/lib/dataSource";

export type Coord = { lat: number; lng: number };
export type Stop = { id: string; name: string; lat: number; lng: number };
export type SimpleRoute = {
    id: string;
    name: string;
    stops: Stop[]; // ordenados
};

function haversine(a: Coord, b: Coord) {
    const R = 6371e3;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const s =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
}

function nearestStops(point: Coord, stops: Stop[], k = 3, maxMeters = 700) {
    const ranked = stops
        .map((s) => ({ s, d: haversine(point, s) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, k)
        .filter((x) => x.d <= maxMeters)
        .map((x) => x.s);
    return ranked;
}

// devuelve subtrayecto (polyline) desde A hasta B dentro de esa ruta (si orden correcto)
function sliceRoutePath(route: SimpleRoute, fromStopId: string, toStopId: string): Stop[] | null {
    const a = route.stops.findIndex((s) => s.id === fromStopId);
    const b = route.stops.findIndex((s) => s.id === toStopId);
    if (a === -1 || b === -1) return null;
    if (a >= b) return null; // asumimos sentido a→b
    return route.stops.slice(a, b + 1);
}

export async function buildGraph(): Promise<{ stops: Stop[]; routes: SimpleRoute[]; stopToRoutes: Map<string, string[]> }> {
    const rawStops: Stop[] = await dsFetchStops();
    const rawRoutes: any[] = await dsFetchRoutes(); // de managua-routes.json

    // normaliza: cada route trae stops como [{id,name,lat,lng}, ...]
    const routes: SimpleRoute[] = rawRoutes.map((r) => ({
        id: r.id,
        name: r.name ?? r.id,
        stops: (r.stops || []).map((s: any) => ({
            id: s.id, name: s.name, lat: s.lat, lng: s.lng
        })),
    }));

    const stopToRoutes = new Map<string, string[]>();
    for (const r of routes) {
        for (const s of r.stops) {
            const list = stopToRoutes.get(s.id) || [];
            list.push(r.id);
            stopToRoutes.set(s.id, list);
        }
    }
    return { stops: rawStops, routes, stopToRoutes };
}

export type PlannedLeg = {
    routeId: string;
    routeName: string;
    fromStop: Stop;
    toStop: Stop;
    path: Stop[]; // subtrayecto
};

export type PlannedTrip =
    | { type: "DIRECT"; legs: [PlannedLeg] }
    | { type: "TRANSFER1"; legs: [PlannedLeg, PlannedLeg] };

export async function planTrip(origin: Coord, destination: Coord): Promise<PlannedTrip | null> {
    const { stops, routes } = await buildGraph();

    const nearA = nearestStops(origin, stops, 3, 800);
    const nearB = nearestStops(destination, stops, 3, 800);
    if (nearA.length === 0 || nearB.length === 0) return null;

    // 1) DIRECTO: una sola ruta con subtrayecto A→B
    for (const r of routes) {
        for (const a of nearA) {
            for (const b of nearB) {
                const sub = sliceRoutePath(r, a.id, b.id);
                if (sub) {
                    return {
                        type: "DIRECT",
                        legs: [{
                            routeId: r.id,
                            routeName: r.name,
                            fromStop: a,
                            toStop: b,
                            path: sub,
                        }]
                    };
                }
            }
        }
    }

    // 2) TRANSBORDO: r1 de A→X y r2 de X→B (X parada común)
    // estrategia simple: probar paradas cercanas como pivote
    for (const r1 of routes) {
        for (const a of nearA) {
            const idxA = r1.stops.findIndex(s => s.id === a.id);
            if (idxA === -1) continue;

            for (const r2 of routes) {
                if (r2.id === r1.id) continue;
                for (const b of nearB) {
                    const idxB = r2.stops.findIndex(s => s.id === b.id);
                    if (idxB === -1) continue;

                    // parada de transbordo común
                    const common = r1.stops.map(s => s.id).filter(id => r2.stops.some(t => t.id === id));
                    for (const pivotId of common) {
                        const leg1 = sliceRoutePath(r1, a.id, pivotId);
                        const leg2 = sliceRoutePath(r2, pivotId, b.id);
                        if (leg1 && leg2) {
                            return {
                                type: "TRANSFER1",
                                legs: [
                                    {
                                        routeId: r1.id,
                                        routeName: r1.name,
                                        fromStop: a,
                                        toStop: r1.stops.find(s => s.id === pivotId)!,
                                        path: leg1,
                                    },
                                    {
                                        routeId: r2.id,
                                        routeName: r2.name,
                                        fromStop: r2.stops.find(s => s.id === pivotId)!,
                                        toStop: b,
                                        path: leg2,
                                    }
                                ]
                            };
                        }
                    }
                }
            }
        }
    }

    return null;
}
