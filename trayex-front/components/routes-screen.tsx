"use client"

import { useState } from "react"
import { Bus, MapPin, Clock, Heart, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Route {
  id: string
  name: string
  description: string
  mainStops: string[]
  status: "active" | "safe" | "incident"
  estimatedTime: string
  capacity: string
  isFavorite: boolean
}

const mockRoutes: Route[] = [
  {
    id: "1",
    name: "Ruta 1 - Norte",
    description: "Campus Central → Zona Industrial",
    mainStops: ["Campus Central", "Av. Principal", "Centro Comercial", "Zona Industrial"],
    status: "active",
    estimatedTime: "15 min",
    capacity: "12/40",
    isFavorite: false,
  },
  {
    id: "2",
    name: "Ruta 2 - Sur",
    description: "Campus Central → Residencias",
    mainStops: ["Campus Central", "Hospital", "Plaza Mayor", "Residencias"],
    status: "safe",
    estimatedTime: "20 min",
    capacity: "8/40",
    isFavorite: true,
  },
  {
    id: "3",
    name: "Ruta 3 - Este",
    description: "Campus Central → Parque Tecnológico",
    mainStops: ["Campus Central", "Biblioteca", "Estadio", "Parque Tecnológico"],
    status: "incident",
    estimatedTime: "25 min",
    capacity: "35/40",
    isFavorite: false,
  },
  {
    id: "4",
    name: "Ruta 4 - Oeste",
    description: "Campus Central → Terminal",
    mainStops: ["Campus Central", "Mercado", "Estación", "Terminal"],
    status: "active",
    estimatedTime: "18 min",
    capacity: "20/40",
    isFavorite: false,
  },
]

const timeBlocks = [
  { id: "morning", label: "Mañana", time: "06:00 - 12:00" },
  { id: "midday", label: "Mediodía", time: "12:00 - 15:00" },
  { id: "afternoon", label: "Tarde", time: "15:00 - 19:00" },
  { id: "night", label: "Noche", time: "19:00 - 23:00" },
]

interface RoutesScreenProps {
  onReserveRoute?: (routeName: string) => void
}

export function RoutesScreen({ onReserveRoute }: RoutesScreenProps) {
  const [routes, setRoutes] = useState<Route[]>(mockRoutes)
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const toggleFavorite = (routeId: string) => {
    setRoutes(routes.map((route) => (route.id === routeId ? { ...route, isFavorite: !route.isFavorite } : route)))
  }

  const getStatusIcon = (status: Route["status"]) => {
    switch (status) {
      case "active":
        return <span className="text-green-500">🟢</span>
      case "safe":
        return <span className="text-blue-500">🔵</span>
      case "incident":
        return <span className="text-red-500">🔴</span>
    }
  }

  const getStatusText = (status: Route["status"]) => {
    switch (status) {
      case "active":
        return "Bus activo"
      case "safe":
        return "Parada segura"
      case "incident":
        return "Incidente"
    }
  }

  const handleReserve = (route: Route) => {
    if (route.status !== "incident" && onReserveRoute) {
      onReserveRoute(route.name)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rutas y Reservas</h1>
            <p className="text-sm text-muted-foreground">Explora y reserva tu viaje</p>
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
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedTimeBlock === block.id
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
        {routes.map((route, index) => (
          <Card
            key={route.id}
            className="overflow-hidden border-2 rounded-3xl hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-5 space-y-4">
              {/* Route Header */}
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
                  <Heart
                    className={`w-5 h-5 ${route.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                  />
                </button>
              </div>

              {/* Main Stops */}
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

              {/* Status and Info */}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(route.status)}
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

              {/* Reserve Button */}
              <Button
                className="w-full h-12 rounded-2xl font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={route.status === "incident"}
                onClick={() => handleReserve(route)}
              >
                {route.status === "incident" ? "No disponible" : "Reservar"}
                {route.status !== "incident" && <ChevronRight className="w-5 h-5 ml-1" />}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
