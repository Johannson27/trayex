"use client";

import { useEffect, useState } from "react";
import { Bus, MapPin, Clock, Heart, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchRoutes, listZones, listStops, listTimeslots, createReservation, getMyReservations } from "@/lib/api";
import { getToken } from "@/lib/session";

type Status = "ACTIVE" | "SAFE" | "INCIDENT";

interface RouteRow {
  id: string;
  name: string;
  description: string | null;
  mainStops: string[];
  status: Status;
  estimatedTime: string;
  capacity: string;
  isFavorite: boolean;
}

const timeBlocks = [
  { id: "morning", label: "Mañana", time: "06:00 - 12:00" },
  { id: "midday", label: "Mediodía", time: "12:00 - 15:00" },
  { id: "afternoon", label: "Tarde", time: "15:00 - 19:00" },
  { id: "night", label: "Noche", time: "19:00 - 23:00" },
];

interface RoutesScreenProps {
  onReserveRoute?: (routeName: string) => void;
}

export function RoutesScreen({ onReserveRoute }: RoutesScreenProps) {
  const token = getToken();
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteRow | null>(null);
  const [zones, setZones] = useState<Array<{ id: string; name: string }>>([]);
  const [zoneId, setZoneId] = useState<string>("");
  const [stops, setStops] = useState<Array<{ id: string; name: string }>>([]);
  const [timeslots, setTimeslots] = useState<Array<{ id: string; startAt: string; endAt: string }>>([]);
  const [stopId, setStopId] = useState<string>("");
  const [timeslotId, setTimeslotId] = useState<string>("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { routes } = await fetchRoutes();
        setRoutes(routes);
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

  const getStatusPill = (status: Status) => {
    if (status === "ACTIVE") return <span className="text-green-500">🟢</span>;
    if (status === "SAFE") return <span className="text-blue-500">🔵</span>;
    return <span className="text-red-500">🔴</span>;
  };

  const getStatusText = (status: Status) => {
    if (status === "ACTIVE") return "Bus activo";
    if (status === "SAFE") return "Parada segura";
    return "Incidente";
  };

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
        const [{ stops }, { timeslots }] = await Promise.all([
          listStops(defaultZone),
          listTimeslots(defaultZone),
        ]);
        setStops(stops.map(s => ({ id: s.id, name: s.name })));
        setTimeslots(timeslots.map(t => ({ id: t.id, startAt: t.startAt, endAt: t.endAt })));
        setStopId(stops[0]?.id || "");
        setTimeslotId(timeslots[0]?.id || "");
      }
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo preparar la reserva");
    }
  };

  const onChangeZone = async (zid: string) => {
    setZoneId(zid);
    setStopId("");
    setTimeslotId("");
    if (!zid) {
      setStops([]);
      setTimeslots([]);
      return;
    }
    const [{ stops }, { timeslots }] = await Promise.all([
      listStops(zid),
      listTimeslots(zid),
    ]);
    setStops(stops.map(s => ({ id: s.id, name: s.name })));
    setTimeslots(timeslots.map(t => ({ id: t.id, startAt: t.startAt, endAt: t.endAt })));
    setStopId(stops[0]?.id || "");
    setTimeslotId(timeslots[0]?.id || "");
  };

  const confirmReservation = async () => {
    if (!token) return alert("Inicia sesión para reservar.");
    if (!timeslotId || !stopId) return alert("Elige un horario y una parada.");

    try {
      setCreating(true);
      await createReservation(token, { timeslotId, stopId });

      // opcional: refrescar reservas
      await getMyReservations(token);

      setShowReserveModal(false);
      if (selectedRoute) onReserveRoute?.(selectedRoute.name);
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (/capacidad/i.test(msg)) {
        alert("La capacidad de ese horario ya está llena. Elige otro horario.");
      } else if (/timeslot|stop/i.test(msg)) {
        alert("Horario o parada inválidos. Intenta seleccionarlos de nuevo.");
      } else {
        alert(msg || "No se pudo crear la reserva");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rutas y Reservas</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Cargando..." : "Explora y reserva tu viaje"}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-transparent"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {err && <p className="text-xs text-red-600 bg-red-100/60 rounded-md p-2">{err}</p>}
      </div>

      {/* Routes List */}
      <div className="p-4 space-y-4">
        {!loading && routes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">No hay rutas disponibles.</p>
        )}
        {routes.map((route, index) => (
          <Card
            key={route.id}
            className="overflow-hidden border-2 rounded-3xl hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom"
            style={{ animationDelay: `${index * 100}ms` }}
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
                <button
                  onClick={() => toggleFavorite(route.id)}
                  className="flex-shrink-0 p-2 rounded-full hover:bg-muted transition-colors"
                >
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
                <div className="flex items-center gap-1.5">
                  {getStatusPill(route.status)}
                  <span className="text-xs font-medium text-muted-foreground">{getStatusText(route.status)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">{route.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Bus className="w-4 h-4" />
                  <span className="text-xs font-medium">{route.capacity}</span>
                </div>
              </div>

              <Button
                className="w-full h-12 rounded-2xl font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={route.status === "INCIDENT"}
                onClick={() => openReserveModal(route)}
              >
                {route.status === "INCIDENT" ? "No disponible" : "Reservar"}
                {route.status !== "INCIDENT" && <ChevronRight className="w-5 h-5 ml-1" />}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal simple de reserva */}
      {showReserveModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setShowReserveModal(false)}
        >
          <Card
            className="w-full max-w-md mx-auto rounded-t-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-foreground">Reservar {selectedRoute?.name}</h2>

            {/* Zona */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Zona</label>
              <select
                className="w-full border rounded-xl p-2 bg-background"
                value={zoneId}
                onChange={(e) => onChangeZone(e.target.value)}
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            {/* Stop */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Parada</label>
              <select
                className="w-full border rounded-xl p-2 bg-background"
                value={stopId}
                onChange={(e) => setStopId(e.target.value)}
              >
                {stops.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Timeslot */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Horario</label>
              <select
                className="w-full border rounded-xl p-2 bg-background"
                value={timeslotId}
                onChange={(e) => setTimeslotId(e.target.value)}
              >
                {timeslots.map((t) => {
                  const start = new Date(t.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  const end = new Date(t.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  return (
                    <option key={t.id} value={t.id}>{start} - {end}</option>
                  );
                })}
              </select>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 rounded-xl"
                onClick={confirmReservation}
                disabled={!timeslotId || !stopId || creating}
              >
                {creating ? "Reservando..." : "Confirmar reserva"}
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowReserveModal(false)}>
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
