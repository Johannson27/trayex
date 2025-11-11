// src/components/dashboard-screen.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Home, Route, Ticket, Bell, User, MapPin, Clock, Users, QrCode, Navigation, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoutesScreen } from "@/components/routes-screen";
import { PassScreen } from "@/components/pass-screen";
import { TripInProgressScreen } from "@/components/trip-in-progress-screen";
import { NotificationsScreen } from "@/components/notifications-screen";
import { ProfileScreen } from "@/components/profile-screen";
import type { UserRole } from "@/types";
import { MapWidget } from "@/components/map-widget";
import { getUser, saveUser, clearToken, getToken } from "@/lib/session";
import { getMe } from "@/lib/api";

type DashboardScreenProps = { userRole: UserRole };
type NavItem = "home" | "routes" | "pass" | "notifications" | "profile";
type MapStop = { lat: number; lng: number; name?: string };

export function DashboardScreen({ userRole }: DashboardScreenProps) {
  const [activeNav, setActiveNav] = useState<NavItem>("home");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tripInProgress, setTripInProgress] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // mapa
  const [mapStops, setMapStops] = useState<MapStop[]>([]);
  const [mapBuses, setMapBuses] = useState<{ lat: number; lng: number }[]>([]);
  const [path, setPath] = useState<{ lat: number; lng: number }[] | undefined>(undefined);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);

  // sesión
  const [user, setUser] = useState<any>(getUser());
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getMe(token)
      .then((res) => {
        if (res?.user) {
          setUser(res.user);
          saveUser(res.user);
        }
      })
      .catch(() => { });
  }, []);

  const displayName = useMemo(() => {
    const full = user?.student?.fullName || user?.student?.fullname;
    if (full && typeof full === "string" && full.trim().length > 0) return full;
    if (user?.email) return user.email;
    return user?.role || userRole || "Usuario";
  }, [user, userRole]);

  // geo
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 12.136389, lng: -86.251389 })
      );
    }
  }, []);

  const center = userLocation ?? { lat: 12.136389, lng: -86.251389 };

  const handleReserveRoute = (routeName: string) => setTripInProgress(routeName);
  const handleEndTrip = () => {
    setTripInProgress(null);
    setActiveNav("home");
  };

  // recibe planificación desde RoutesScreen
  const handlePlannedTrip = (payload: {
    routeId: string;
    from: MapStop;
    to: MapStop;
    stopsToShow: MapStop[];
    path: { lat: number; lng: number }[];
  }) => {
    setMapStops(payload.stopsToShow);
    setOrigin({ lat: payload.from.lat, lng: payload.from.lng });
    setDestination({ lat: payload.to.lat, lng: payload.to.lng });
    setPath(payload.path);

    // buses demo cerca de la mitad
    const midLat = (payload.from.lat + payload.to.lat) / 2;
    const midLng = (payload.from.lng + payload.to.lng) / 2;
    setMapBuses([
      { lat: midLat + 0.0015, lng: midLng - 0.001 },
      { lat: midLat - 0.001, lng: midLng + 0.0015 },
    ]);

    setActiveNav("home");
  };

  if (tripInProgress) {
    return <TripInProgressScreen routeName={tripInProgress} onEndTrip={handleEndTrip} />;
  }

  const renderContent = () => {
    switch (activeNav) {
      case "routes":
        return (
          <RoutesScreen
            onReserveRoute={handleReserveRoute}
            onPlannedTrip={handlePlannedTrip}
          />
        );
      case "pass":
        return <PassScreen />;
      case "notifications":
        return <NotificationsScreen onUpdateUnreadCount={setUnreadCount} />;
      case "profile":
        return <ProfileScreen userRole={userRole} />;
      case "home":
      default:
        return (
          <div className="flex-1 relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Bienvenido</p>
                <h2 className="text-lg font-semibold">{displayName}</h2>
              </div>
              <Button
                variant="outline"
                className="rounded-xl gap-2"
                onClick={() => {
                  clearToken();
                  location.reload();
                }}
              >
                <LogOut className="w-4 h-4" />
                Salir
              </Button>
            </div>

            {/* Mapa */}
            <div className="absolute inset-0">
              <MapWidget
                center={center}
                zoom={13}
                buses={mapBuses}
                stops={[]} // vacío para no lag
                path={path}
                origin={origin}
                destination={destination}
                stopsOnPath={mapStops}
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            {/* Card inferior */}
            <div className="absolute bottom-20 left-0 right-0 p-4">
              <Card className="bg-card/95 backdrop-blur-lg border-2 rounded-3xl shadow-2xl p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Parada favorita</p>
                        <p className="font-semibold text-foreground">Campus Central</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      <Clock className="w-3 h-3 mr-1" />
                      5 min
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Navigation className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Parada más cercana</p>
                        <p className="font-semibold text-foreground">Av. Principal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full">
                        <Users className="w-3 h-3 mr-1" />
                        12/40
                      </Badge>
                      <Badge variant="secondary" className="rounded-full">
                        <Clock className="w-3 h-3 mr-1" />
                        2 min
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full h-14 rounded-2xl text-lg font-semibold bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
                  onClick={() => setActiveNav("pass")}
                >
                  <QrCode className="w-6 h-6" />
                  Pase listo para abordar
                </Button>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {renderContent()}
      <nav className="bg-card border-t border-border px-2 py-3 safe-area-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveNav("home")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors ${activeNav === "home" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Inicio</span>
          </button>
          <button
            onClick={() => setActiveNav("routes")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors ${activeNav === "routes" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
          >
            <Route className="w-6 h-6" />
            <span className="text-xs font-medium">Rutas</span>
          </button>
          <button
            onClick={() => setActiveNav("pass")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors ${activeNav === "pass" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
          >
            <Ticket className="w-6 h-6" />
            <span className="text-xs font-medium">Pase</span>
          </button>
          <button
            onClick={() => setActiveNav("notifications")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors relative ${activeNav === "notifications" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
          >
            <Bell className="w-6 h-6" />
            <span className="text-xs font-medium">Avisos</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-2 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveNav("profile")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors ${activeNav === "profile" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
