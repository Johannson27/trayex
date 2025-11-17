// src/components/routes-screen.tsx
"use client";

import Image from "next/image";
import { MapPin, Search } from "lucide-react";

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
  stops?: StopRow[];
  shape?: { lat: number; lng: number }[];
};

interface RoutesScreenProps {
  onReserveRoute?: (routeName: string) => void;
  onPlannedTrip?: (payload: {
    routeId: string;
    from: { lat: number; lng: number; name?: string };
    to: { lat: number; lng: number; name?: string };
    stopsToShow: { lat: number; lng: number; name?: string }[];
    path: { lat: number; lng: number }[];
  }) => void;
}

/**
 * Diseño nuevo de "Rutas":
 * - Zona superior: mapa (luego reemplazas el placeholder con Google Maps).
 * - Barra de búsqueda flotando arriba.
 * - Tarjeta de "Mi parada: Central" con foto y datos.
 * - Botón que dispara onReserveRoute("Ruta 117") para ir al Estado de viaje.
 */
export function RoutesScreen({ onReserveRoute, onPlannedTrip }: RoutesScreenProps) {
  const handleSelectStop = () => {
    // 👉 Esto dispara tu TripInProgressScreen (Estado del viaje)
    onReserveRoute?.("Ruta 117");

    // 👉 Si quieres que también pinte algo en el mapa del dashboard,
    // mandamos un payload de ejemplo a onPlannedTrip
    onPlannedTrip?.({
      routeId: "ruta-117",
      from: {
        lat: 12.1365,
        lng: -86.2515,
        name: "Mi parada: Central",
      },
      to: {
        lat: 12.1405,
        lng: -86.255,
        name: "Destino de ejemplo",
      },
      stopsToShow: [],
      path: [],
    });
  };

  return (
    <div className="flex-1 flex justify-center bg-[#F3F4F6]">
      <div className="w-full max-w-md px-4 pt-6 pb-24">

        {/* === CONTENEDOR MAPA + BUSCADOR === */}
        <div className="relative w-full">
          {/* Mapa (aquí luego pones Google Maps) */}
          <div className="h-[320px] rounded-3xl overflow-hidden shadow-md bg-slate-200 relative">
            {/* 🔁 Placeholder: reemplaza este div por tu componente de Google Maps */}
            <div id="routes-map" className="w-full h-full">
              <Image
                src="/assets/bg-routes-map.jpg" // o cambia por el nombre que tengas
                alt="Mapa de paradas"
                fill
                className="object-cover"
              />
            </div>

            {/* Pin amarillo en el centro */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-[#FFC933] shadow-lg flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white" />
              </div>
            </div>
          </div>

          {/* Barra de búsqueda flotando ligeramente SOBRE el mapa */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-[88%]">
            <div className="bg-white shadow-lg rounded-full px-4 h-12 flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Busca una dirección"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* SEPARACIÓN ENTRE MAPA Y TARJETA */}
        <div className="h-7" />

        {/* === TARJETA "MI PARADA: CENTRAL" === */}
        <div className="w-full">
          <button
            onClick={handleSelectStop}
            className="w-full text-left rounded-3xl bg-white shadow-[0_18px_40px_rgba(0,0,0,0.18)] overflow-hidden transition-all duration-300 hover:shadow-[0_22px_50px_rgba(0,0,0,0.25)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.99]"
          >
            {/* Foto de la parada */}
            <div className="relative w-full h-[150px]">
              <Image
                src="/assets/dashboard-hero.jpg" // exporta esta imagen con este nombre
                alt="Parada de buses"
                fill
                className="object-cover"
              />
            </div>

            {/* Contenido */}
            <div className="px-5 pt-4 pb-4">
              <h3 className="font-semibold text-lg text-slate-900">
                Mi parada: Central
              </h3>

              <p className="text-xs mt-1 flex items-center gap-1 text-gray-600">
                <MapPin className="w-3 h-3 text-[#FFC933]" />
                123 Anywhere st. Any city, ST 12345
              </p>

              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Buses que llegan
                </p>

                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-blue-600 font-bold">A</span>{" "}
                    Bus 123
                  </p>
                  <p>
                    <span className="text-red-600 font-bold">B</span>{" "}
                    Bus 111
                  </p>
                  <p>
                    <span className="text-green-600 font-bold">$</span>{" "}
                    C$: 2.50
                  </p>
                </div>
              </div>

              {/* Botón para ir al Estado del viaje */}
              <div className="mt-5">
                <div className="w-full h-[44px] rounded-[999px] bg-gradient-to-r from-[#FFC933] via-[#F6A33A] to-[#F27C3A] flex items-center justify-center text-white text-sm font-semibold shadow-[0_14px_28px_rgba(0,0,0,0.25)]">
                  Ver estado del viaje
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
