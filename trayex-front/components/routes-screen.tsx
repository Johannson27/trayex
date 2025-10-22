"use client";

import { useEffect, useMemo, useState } from "react";
import { Bus, MapPin, Clock, Heart, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchRoutes, cancelReservation } from "@/lib/api";
import { getToken } from "@/lib/session";
import { createReservation } from "@/lib/api";


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

  const handleReserve = async (route: RouteRow) => {
    if (route.status === "INCIDENT") return;
    if (!token) return alert("Inicia sesión para reservar.");
    try {
      await createReservation(token, route.id);
      onReserveRoute?.(route.name);
    } catch (e: any) {
      alert(e?.message ?? "No se pudo reservar");
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

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 animate-in slide-in-from-top duration-300">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Bloque horario</p>
              <div className="grid grid-cols-2 gap-2">
                {timeBlocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => setSelectedTimeBlock(selectedTimeBlock === block.id ? null : block.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${selectedTimeBlock === block.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground"
                      }`}
                  >
                    <p className="text-sm font-semibold">{block.label}</p>
                    <p className="text-xs text-muted-foreground">{block.time}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
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
                  <svg
                    className={`w-5 h-5 ${route.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21s-6.716-4.35-9.428-7.062C-0.284 11.79.17 7.79 3.172 6.172 6.174 4.555 8.53 6.26 12 9.5c3.47-3.24 5.826-4.945 8.828-3.328 3.002 1.618 3.456 5.618.6 7.766C18.716 16.65 12 21 12 21z" />
                  </svg>
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
                onClick={() => handleReserve(route)}
              >
                {route.status === "INCIDENT" ? "No disponible" : "Reservar"}
                {route.status !== "INCIDENT" && <ChevronRight className="w-5 h-5 ml-1" />}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
