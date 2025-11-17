"use client"

import Image from "next/image"
import { useState } from "react"
import { Bus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type RouteItem = {
  id: string
  code: string
  universities: string
  isFavorite: boolean
}

type TimeSlotId = "morning" | "noon" | "afternoon" | "night"

const MOCK_ROUTES: RouteItem[] = [
  {
    id: "123",
    code: "123",
    universities: "ULAM, UDM, UCYT",
    isFavorite: true,
  },
  {
    id: "111",
    code: "111",
    universities: "UNCSM, UNI, UNI-RUPAP, UNP, UNAN",
    isFavorite: false,
  },
  {
    id: "102",
    code: "102",
    universities: "UNCSM, UNI, UNI-RUPAP, UNP",
    isFavorite: false,
  },
  {
    id: "6",
    code: "6",
    universities: "UNI-RUPAP, UNP",
    isFavorite: false,
  },
  {
    id: "104",
    code: "104",
    universities: "UNIVALLE, UNI-RUPAP, UDM, UCYT",
    isFavorite: false,
  },
  {
    id: "117",
    code: "117",
    universities: "UNCSM, UNICIT, UNAN",
    isFavorite: false,
  },
]

// ahora usamos TUS svg como iconos
const TIME_SLOTS: { id: TimeSlotId; label: string; icon: string }[] = [
  { id: "morning", label: "MAÑANA", icon: "/assets/mañana.svg" },
  { id: "noon", label: "MEDIO DÍA", icon: "/assets/mediodia.svg" },
  { id: "afternoon", label: "TARDE", icon: "/assets/tarde.svg" },
  { id: "night", label: "NOCHE", icon: "/assets/noche.svg" },
]

export function PassesScreen() {
  const [routes, setRoutes] = useState<RouteItem[]>(MOCK_ROUTES)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(
    MOCK_ROUTES[0]?.id ?? null,
  )
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotId | null>("morning")

  const selectedRoute =
    routes.find((r) => r.id === selectedRouteId) ?? routes[0]

  const toggleFavorite = (id: string) => {
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isFavorite: !r.isFavorite } : r,
      ),
    )
  }

  const handleReserve = () => {
    // aquí luego metes la lógica real 💳
    alert("Aquí va la lógica para crear la reserva ✨")
  }

  return (
    // NO le ponemos bg aquí para que se vea el mismo fondo
    // del dashboard (bg-dashboard.jpg)
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-md mx-auto px-4 pt-6 pb-8 space-y-6">
        {/* título grande arriba, como en el figma */}
        <h1 className="text-center text-white text-xl font-semibold drop-shadow mb-1">
          Reserva
        </h1>

        {/* BLOQUE 1: EXPLORAR RUTAS */}
        <div className="rounded-[32px] bg-white/95 px-4 pt-5 pb-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h2 className="text-left text-[#153fba] text-sm font-semibold mb-3">
            Explorar rutas
          </h2>

          <div className="space-y-3">
            {routes.map((route) => (
              <div
                key={route.id}
                className={`w-full rounded-[999px] bg-white flex items-center justify-between px-4 py-3 shadow-md active:scale-[0.97] transition-transform cursor-pointer border
                ${selectedRouteId === route.id
                    ? "border-[#153fba]"
                    : "border-transparent"
                  }`}
                onClick={() => setSelectedRouteId(route.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src="/assets/bus-fares.png"
                      alt="Bus"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-semibold text-[#153fba] leading-none">
                      {route.code}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">
                      {route.universities}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="relative w-8 h-8 flex items-center justify-center active:scale-90 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(route.id)
                  }}
                >
                  <span
                    className={`relative w-7 h-7 transition-transform ${route.isFavorite ? "scale-110" : "scale-100"
                      }`}
                  >
                    <Image
                      src={
                        route.isFavorite
                          ? "/assets/favorito-activado.jpg"
                          : "/assets/favorito.png"
                      }
                      alt="Favorito"
                      fill
                      className="object-contain"
                    />
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* BLOQUE 2: TARJETA DE RESERVA (foto + barra de horarios) */}
        <Card className="mt-1 rounded-[28px] border-0 shadow-xl overflow-hidden bg-white/95">
          {/* Foto superior de la parada (como en la 2ª imagen) */}
          <div className="relative w-full h-40">
            <Image
              src="/assets/dashboard-hero.jpg"
              alt="Parada de buses"
              fill
              className="object-cover"
            />
          </div>

          <div className="px-5 pt-4 pb-5 space-y-4">
            {/* Header de la tarjeta (Ruta + estado) */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-[#153fba]" />
                  <p className="text-xs text-slate-500">Reserva para ruta</p>
                </div>
                <p className="text-lg font-semibold text-slate-900 leading-tight">
                  {selectedRoute?.code ?? "—"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {selectedRoute?.universities ??
                    "Selecciona una ruta para ver detalles"}
                </p>
              </div>

              <Badge className="rounded-full bg-[#ffce45] text-xs font-semibold text-slate-900 px-3 py-1 shadow-sm">
                Disponible hoy
              </Badge>
            </div>

            {/* Texto "Escoge tu tiempo..." */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-800">
                Escoge tu tiempo para reservar
              </p>

              {/* Barra SVG de reserva + botones encima */}
              <div className="relative mt-1 h-24">
                <Image
                  src="/assets/reserva-bg.svg"
                  alt="Selector de tiempo"
                  fill
                  className="object-contain pointer-events-none select-none"
                />
                <div className="absolute inset-0 flex items-center justify-between px-7">
                  {TIME_SLOTS.map((slot) => {
                    const isActive = selectedSlot === slot.id
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot.id)}
                        className="flex flex-col items-center justify-center text-[10px] font-semibold gap-1"
                      >
                        <div
                          className={`relative w-8 h-8 transition-all ${isActive ? "scale-110" : "opacity-70"
                            }`}
                        >
                          <Image
                            src={slot.icon}
                            alt={slot.label}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span
                          className={
                            isActive ? "text-[#F39A18]" : "text-slate-500"
                          }
                        >
                          {slot.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Botón principal */}
            <Button
              className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#FFC933] to-[#FF8C33] text-slate-900 hover:brightness-105"
              onClick={handleReserve}
            >
              Confirmar reserva
            </Button>

            {/* Mini texto informativo */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-[11px] text-slate-500">
                Una vez confirmes, tu reserva aparecerá en la sección{" "}
                <span className="font-semibold">“Rutas y reservas”</span>.
              </p>
              <p className="text-[10px] text-slate-400">
                *Aquí luego puedes conectar la API real de reservas y
                favoritos.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
