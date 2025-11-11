"use client";

import { useEffect, useMemo, useState } from "react";
import { Bus, MapPin, Clock, Heart, ChevronRight, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listZones, listStops, listTimeslots, createReservation, getMyReservations } from "@/lib/api";
import { getToken } from "@/lib/session";
import { dsFetchRoutes, dsFetchStops } from "@/lib/dataSource";

type Status = "ACTIVE" | "SAFE" | "INCIDENT";

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
  status: Status;
  estimatedTime: string;
  capacity: string;
  isFavorite: boolean;
  // 👇 NUEVO: paradas en orden (si vienen en el JSON OSM)
  stops?: StopRow[];
};

interface RoutesScreenProps {
  onReserveRoute?: (routeName: string) => void;
  onPlannedTrip?: (payload: {
    routeId: string;
    from: { lat: number; lng: number; name?: string };
    to: { lat: number; lng: number; name?: string };
    stopsToShow: { lat: number; lng: number; name?: string }[];
    path: { lat: number; lng: number }[]; // 👈 NUEVO
  }) => void;
}

const PAGE_SIZE = 12;

export function RoutesScreen({ onReserveRoute, onPlannedTrip }: RoutesScreenProps) {
  const token = getToken();

  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [allStops, setAllStops] = useState<StopRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Filtros UI
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Modal reserva clásica
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteRow | null>(null);
  const [zones, setZones] = useState<Array<{ id: string; name: string }>>([]);
  const [zoneId, setZoneId] = useState<string>("");
  const [stops, setStops] = useState<Array<{ id: string; name: string }>>([]);
  const [timeslots, setTimeslots] = useState<Array<{ id: string; startAt: string; endAt: string }>>([]);
  const [stopId, setStopId] = useState<string>("");
  const [timeslotId, setTimeslotId] = useState<string>("");
  const [creating, setCreating] = useState(false);

  // Modal PLAN (O/D sobre OSM)
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planRoute, setPlanRoute] = useState<RouteRow | null>(null);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromStop, setFromStop] = useState<StopRow | null>(null);
  const [toStop, setToStop] = useState<StopRow | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [rts, stps] = await Promise.all([dsFetchRoutes(), dsFetchStops()]);
        setRoutes(rts || []);
        setAllStops(stps || []);
      } catch (e: any) {
        setErr(e?.message ?? "No se pudieron cargar las rutas");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleFavorite = (routeId: string) => {
    setRoutes((rs) => rs.map((r) => (r.id === routeId ? { ...r, isFavorite: !r.isFavorite } : r)));
  };

  // 🔎 filtro
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter((r) => {
      if (r.name.toLowerCase().includes(q)) return true;
      return r.mainStops.some((s) => s.toLowerCase().includes(q));
    });
  }, [routes, search]);

  const shown = useMemo(() => (showAll ? filtered : filtered.slice(0, PAGE_SIZE)), [filtered, showAll]);

  // reserva clásica
  const openReserveModal = async (route: RouteRow) => {
    if (route.status === "INCIDENT") return;
    if (!token) return alert("Inicia sesión para reservar.");

    setSelectedRoute(route);
    setShowReserveModal(true);

    try {
      const { zones } = await listZones();
      setZones(zones);
      const defaultZone = zones[0]?.id || "";
      setZoneId(defaultZone);

      if (defaultZone) {
        const [{ stops }, { timeslots }] = await Promise.all([listStops(defaultZone), listTimeslots(defaultZone)]);
        setStops(stops.map((s) => ({ id: s.id, name: s.name })));
        setTimeslots(timeslots.map((t) => ({ id: t.id, startAt: t.startAt, endAt: t.endAt })));
        setStopId(stops[0]?.id || "");
        setTimeslotId(timeslots[0]?.id || "");
      }
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo preparar la reserva");
    }
  };

  // plan O/D
  const openPlanModal = (route: RouteRow) => {
    setPlanRoute(route);
    setFromQuery("");
    setToQuery("");
    setFromStop(null);
    setToStop(null);
    setShowPlanModal(true);
  };

  // sugerencias de paradas por texto
  const suggestStops = (q: string) => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return allStops
      .filter((st) => st.name.toLowerCase().includes(s))
      .slice(0, 8);
  };

  // corta el tramo A→B usando el orden de paradas de la ruta
  const slicePath = (route: RouteRow, fromId: string, toId: string) => {
    const arr = route.stops ?? [];
    const a = arr.findIndex((x) => x.id === fromId);
    const b = arr.findIndex((x) => x.id === toId);
    if (a === -1 || b === -1) return null;
    if (a >= b) return null; // asumimos sentido A→B
    return arr.slice(a, b + 1).map((s) => ({ lat: s.lat, lng: s.lng }));
  };

  const confirmPlan = () => {
    if (!planRoute || !fromStop || !toStop) return;

    const path = slicePath(planRoute, fromStop.id, toStop.id) ?? [
      // fallback: recta si no encontramos el orden
      { lat: fromStop.lat, lng: fromStop.lng },
      { lat: toStop.lat, lng: toStop.lng },
    ];

    const stopsToShow = (planRoute.stops ?? [])
      .filter((s) => path.some((p) => p.lat === s.lat && p.lng === s.lng))
      .map((s) => ({ lat: s.lat, lng: s.lng, name: s.name }));

    onPlannedTrip?.({
      routeId: planRoute.id,
      from: { lat: fromStop.lat, lng: fromStop.lng, name: `Origen: ${fromStop.name}` },
      to: { lat: toStop.lat, lng: toStop.lng, name: `Destino: ${toStop.name}` },
      stopsToShow,
      path,
    });

    setShowPlanModal(false);
  };

  // === UI ===
  return (
    <div className="flex-1 overflow-y-auto bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rutas</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Cargando..." : `Mostrando ${shown.length} de ${filtered.length}`}
            </p>
          </div>
          <Button variant="outline" size="icon" className="rounded-full bg-transparent" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* 🔎 Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowAll(false);
            }}
            placeholder="Buscar ruta o parada principal…"
            className="w-full pl-10 pr-3 h-11 rounded-xl border bg-background"
          />
        </div>

        {err && <p className="text-xs text-red-600 bg-red-100/60 rounded-md p-2">{err}</p>}
      </div>

      {/* Listado */}
      <div className="p-4 space-y-4">
        {!loading && shown.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">No hay coincidencias.</p>
        )}

        {shown.map((route, index) => (
          <Card
            key={route.id}
            className="overflow-hidden border-2 rounded-3xl hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bus className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-foreground">{route.name}</h3>
                    <p className="text-sm text-muted-foreground">{route.description}</p>
                  </div>
                </div>
                <button onClick={() => toggleFavorite(route.id)} className="flex-shrink-0 p-2 rounded-full hover:bg-muted transition-colors">
                  <Heart className={`w-5 h-5 ${route.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Paradas principales</p>
                <div className="flex flex-wrap gap-2">
                  {route.mainStops.slice(0, 3).map((stop, idx) => (
                    <Badge key={idx} variant="secondary" className="rounded-full text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      {stop}
                    </Badge>
                  ))}
                  {route.mainStops.length > 3 && (
                    <Badge variant="outline" className="rounded-full text-xs">
                      +{route.mainStops.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">{route.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Bus className="w-4 h-4" />
                  <span className="text-xs font-medium">{route.capacity}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Planificar (OSM) */}
                <Button className="h-11 rounded-2xl font-semibold" onClick={() => openPlanModal(route)}>
                  Planificar (Elegir origen/destino)
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>

                {/* (Opcional) Reservar clásico contra API */}
                <Button
                  variant="outline"
                  className="h-11 rounded-2xl font-semibold"
                  disabled={route.status === "INCIDENT"}
                  onClick={() => openReserveModal(route)}
                >
                  {route.status === "INCIDENT" ? "No disponible" : "Reservar (API)"}
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filtered.length > PAGE_SIZE && !showAll && (
          <div className="pt-2">
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setShowAll(true)}>
              Ver más rutas
            </Button>
          </div>
        )}
      </div>

      {/* ===== Modal PLAN O/D (OSM) ===== */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowPlanModal(false)}>
          <Card className="w-full max-w-md mx-auto rounded-t-3xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-foreground">Planificar en {planRoute?.name}</h2>

            {/* Origen */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Origen</label>
              <input
                className="w-full border rounded-xl p-2 bg-background"
                placeholder="Ej. UAM"
                value={fromQuery}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  setFromStop(null);
                }}
              />
              {fromQuery && !fromStop && (
                <div className="border rounded-xl divide-y max-h-44 overflow-auto">
                  {suggestStops(fromQuery).map((s) => (
                    <button key={s.id} className="w-full text-left px-3 py-2 hover:bg-muted" onClick={() => setFromStop(s)}>
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
              {fromStop && <p className="text-xs text-muted-foreground">Seleccionado: {fromStop.name}</p>}
            </div>

            {/* Destino */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Destino</label>
              <input
                className="w-full border rounded-xl p-2 bg-background"
                placeholder="Ej. Mercado Roberto Huembes"
                value={toQuery}
                onChange={(e) => {
                  setToQuery(e.target.value);
                  setToStop(null);
                }}
              />
              {toQuery && !toStop && (
                <div className="border rounded-xl divide-y max-h-44 overflow-auto">
                  {suggestStops(toQuery).map((s) => (
                    <button key={s.id} className="w-full text-left px-3 py-2 hover:bg-muted" onClick={() => setToStop(s)}>
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
              {toStop && <p className="text-xs text-muted-foreground">Seleccionado: {toStop.name}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1 rounded-xl" onClick={confirmPlan} disabled={!fromStop || !toStop}>
                Mostrar en el mapa
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowPlanModal(false)}>
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ===== Modal reserva clásica (si la usas) ===== */}
      {showReserveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowReserveModal(false)}>
          <Card className="w-full max-w-md mx-auto rounded-t-3xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-foreground">Reservar {selectedRoute?.name}</h2>
            {/* aquí va tu UI de zonas/paradas/horarios si la mantienes */}
          </Card>
        </div>
      )}
    </div>
  );
}
