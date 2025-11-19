"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Bus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type RouteItem = {
  id: string;
  code: string;
  universities: string;
  isFavorite: boolean;
};

type TimeSlotId = "morning" | "noon" | "afternoon" | "night";

const MOCK_ROUTES: RouteItem[] = [
  { id: "102", code: "102", universities: "UNI, UNP, UNI-RUPAP", isFavorite: false },
  { id: "103", code: "103", universities: "UNI, UNAN", isFavorite: false },
  { id: "104", code: "104", universities: "UNI, UAM, UDM, UCYT", isFavorite: false },
  { id: "105", code: "105", universities: "UNAN, UNIVALLE", isFavorite: false },
  { id: "110", code: "110", universities: "UNI, UNP", isFavorite: false },
  { id: "111", code: "111", universities: "UNI, UNI-RUPAP, UNP, UNAN", isFavorite: false },
  { id: "114", code: "114", universities: "UNAN, UNI-RUPAP", isFavorite: false },
  { id: "117", code: "117", universities: "UNAN, UNICIT, UNI", isFavorite: false },
  { id: "118", code: "118", universities: "UNI, UNP", isFavorite: false },
  { id: "119", code: "119", universities: "UNI, UNP", isFavorite: false },
  { id: "120", code: "120", universities: "UNI, UNI-RUPAP", isFavorite: false },
  { id: "121", code: "121", universities: "UNI, UAM", isFavorite: false },
  { id: "123", code: "123", universities: "ULAM, UDM, UCYT", isFavorite: true },
  { id: "158", code: "158", universities: "UNI, UNP, UNAN", isFavorite: false },
  { id: "195", code: "195", universities: "UNI, UNP, UNI-RUPAP", isFavorite: false }
];


const TIME_SLOTS = [
  { id: "morning", label: "MAÑANA", icon: "/assets/mañana.svg" },
  { id: "noon", label: "MEDIO DÍA", icon: "/assets/mediodia.svg" },
  { id: "afternoon", label: "TARDE", icon: "/assets/tarde.svg" },
  { id: "night", label: "NOCHE", icon: "/assets/noche.svg" },
];

export function PassesScreen({ setActiveNav }: { setActiveNav: any }) {
  const [routes, setRoutes] = useState<RouteItem[]>(MOCK_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0].id);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotId>("morning");
  const [university, setUniversity] = useState<any>(null);

  // Cargar universidad desde almacenamiento
  useEffect(() => {
    const stored = localStorage.getItem("selectedUniversity");
    if (stored) setUniversity(JSON.parse(stored));
  }, []);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId)!;

  const toggleFavorite = (id: string) =>
    setRoutes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );

  const handleReserve = () => {
    if (!university) return alert("Debes seleccionar una universidad primero.");

    const stored = JSON.parse(localStorage.getItem("currentUserLocation") || "{}");

    const origin = stored.name || "Mi ubicación";

    const reservation = {
      id: crypto.randomUUID(),
      route: selectedRoute.code,
      universities: university.name,
      address: university.address,
      timeSlot: selectedSlot,
      timestamp: new Date().toISOString(),
      price: "C$ 2.50",

      // A y B reales
      origin,
      destination: university.name,

      // Data del QR
      qrData: `${selectedRoute.code}|A:${origin}|B:${university.name}|${selectedSlot}|${Date.now()}`,
    };

    // Guardar última reserva
    localStorage.setItem("latestReservation", JSON.stringify(reservation));

    // Agregar a historial
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    history.unshift(reservation);
    localStorage.setItem("history", JSON.stringify(history));

    setActiveNav("fares");
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-md mx-auto px-4 pt-6 pb-8 space-y-6">
        <h1 className="text-center text-white text-xl font-semibold drop-shadow mb-1">
          Reserva
        </h1>

        {university && (
          <div className="text-white text-center text-sm mb-2 drop-shadow">
            Reservando para:
            <br />
            <span className="font-semibold">{university.name}</span>
          </div>
        )}

        {/* LISTA DE RUTAS */}
        {/* LISTA DE RUTAS */}
        <div className="rounded-[32px] bg-white/95 px-4 pt-5 pb-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">

          <h2 className="text-[#153fba] text-sm font-semibold mb-3">
            Explorar rutas
          </h2>

          {/* CONTENEDOR CON SCROLL INTERNO */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#153fba]/50 scrollbar-track-transparent">

            {routes.map((route) => (
              <div
                key={route.id}
                className={`w-full rounded-[999px] bg-white flex items-center justify-between px-4 py-3 shadow-md cursor-pointer border ${selectedRouteId === route.id
                  ? "border-[#153fba]"
                  : "border-transparent"
                  }`}
                onClick={() => setSelectedRouteId(route.id)}
              >
                <div className="flex items-center gap-3">
                  <Image src="/assets/bus-fares.png" alt="" width={40} height={40} />
                  <div>
                    <p className="text-base font-semibold text-[#153fba] leading-none">
                      {route.code}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">
                      {route.universities}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(route.id);
                  }}
                >
                  <Image
                    src={
                      route.isFavorite
                        ? "/assets/favorito-activado.jpg"
                        : "/assets/favorito.png"
                    }
                    width={26}
                    height={26}
                    alt=""
                  />
                </button>
              </div>
            ))}

          </div>
        </div>


        {/* TARJETA DE RESERVA */}
        <Card className="rounded-[28px] shadow-xl overflow-hidden bg-white/95 border-0">
          <div className="relative h-40 w-full">
            <Image src="/assets/dashboard-hero.jpg" alt="" fill className="object-cover" />
          </div>

          <div className="px-5 pt-4 pb-5 space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  <Bus className="w-4 h-4 text-[#153fba]" />
                  Reserva para ruta
                </p>

                <p className="text-lg font-semibold">{selectedRoute.code}</p>

                <p className="text-[11px] text-slate-500">
                  {university ? university.name : "Selecciona desde el mapa"}
                </p>
              </div>

              <Badge className="rounded-full bg-[#ffce45] text-xs text-slate-900 px-3 py-1 shadow">
                Disponible hoy
              </Badge>
            </div>

            {/* HORARIOS */}
            <div className="relative mt-2 h-24">
              <Image src="/assets/reserva-bg.svg" alt="" fill className="object-contain" />

              <div className="absolute inset-0 flex justify-between px-7">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id as TimeSlotId)}
                    className="flex flex-col items-center text-[10px] font-semibold"
                  >
                    <Image
                      src={slot.icon}
                      width={30}
                      height={30}
                      alt=""
                      className={selectedSlot === slot.id ? "scale-110" : "opacity-70"}
                    />
                    <span
                      className={
                        selectedSlot === slot.id ? "text-[#F39A18]" : "text-slate-500"
                      }
                    >
                      {slot.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#FFC933] to-[#FF8C33]"
              onClick={handleReserve}
            >
              Confirmar reserva
            </Button>

            <p className="text-[10px] text-slate-400 text-center">
              *Tu reserva aparecerá en Tarifas.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
