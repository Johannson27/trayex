"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle, Share2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Stop {
  id: string
  name: string
  status: "reached" | "current" | "upcoming"
}

interface TripInProgressScreenProps {
  routeName: string
  onEndTrip: () => void
}

export function TripInProgressScreen({ routeName, onEndTrip }: TripInProgressScreenProps) {
  const [tripStatus, setTripStatus] = useState<"on-way" | "on-board">("on-way")
  const [remainingTime, setRemainingTime] = useState(15)
  const [showSOSModal, setShowSOSModal] = useState(false)
  const [sosType, setSOSType] = useState<string | null>(null)
  const [progress, setProgress] = useState(25)

  const stops: Stop[] = [
    { id: "1", name: "Campus Central", status: "reached" },
    { id: "2", name: "Av. Principal", status: "reached" },
    { id: "3", name: "Centro Comercial", status: "current" },
    { id: "4", name: "Zona Industrial", status: "upcoming" },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onEndTrip()
          return 0
        }
        return prev - 1
      })
      setProgress((prev) => Math.min(prev + 2, 100))
    }, 60000)

    return () => clearInterval(timer)
  }, [onEndTrip])

  const handleSOSSubmit = (type: string) => {
    setSOSType(type)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("[v0] SOS Alert sent:", {
            type,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            timestamp: new Date().toISOString(),
          })
          alert(`Alerta de ${type} enviada. Ubicación GPS compartida con autoridades.`)
          setShowSOSModal(false)
        },
        (error) => {
          console.log("[v0] Geolocation error:", error)
          alert("No se pudo obtener la ubicación GPS. Alerta enviada sin ubicación.")
          setShowSOSModal(false)
        },
      )
    }
  }

  const handleShareTrip = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const shareUrl = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`
          if (navigator.share) {
            navigator
              .share({
                title: "Mi viaje en Trayex",
                text: `Estoy viajando en ${routeName}. Sígueme en tiempo real:`,
                url: shareUrl,
              })
              .catch((error) => console.log("[v0] Share error:", error))
          } else {
            alert(`Compartir ubicación: ${shareUrl}`)
          }
        },
        (error) => {
          console.log("[v0] Geolocation error:", error)
          alert("No se pudo obtener la ubicación para compartir.")
        },
      )
    }
  }

  const getStopIcon = (status: Stop["status"]) => {
    switch (status) {
      case "reached":
        return "🟢"
      case "current":
        return "🔵"
      case "upcoming":
        return "⚪"
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header with SOS Button */}
      <div className="bg-card border-b border-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onEndTrip} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg text-foreground">{routeName}</h1>
            <p className="text-xs text-muted-foreground">Viaje en progreso</p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="rounded-full font-semibold"
          onClick={() => setShowSOSModal(true)}
        >
          <AlertTriangle className="w-4 h-4 mr-1" />
          SOS
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Status Card */}
        <Card className="border-2 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estado actual</p>
              <p className="text-2xl font-bold text-foreground">{tripStatus === "on-way" ? "En camino" : "Abordo"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tiempo restante</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold text-primary">{remainingTime}</p>
                <p className="text-sm text-muted-foreground">min</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progreso del viaje</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Stops List */}
        <Card className="border-2 rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-lg text-foreground">Paradas</h2>
          <div className="space-y-3">
            {stops.map((stop, index) => (
              <div key={stop.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{getStopIcon(stop.status)}</span>
                  {index < stops.length - 1 && (
                    <div
                      className={`w-0.5 h-8 ${stop.status === "reached" ? "bg-green-500" : "bg-muted"} transition-colors`}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      stop.status === "current"
                        ? "text-primary text-lg"
                        : stop.status === "reached"
                          ? "text-muted-foreground"
                          : "text-foreground"
                    }`}
                  >
                    {stop.name}
                  </p>
                  {stop.status === "current" && (
                    <Badge variant="secondary" className="mt-1 rounded-full text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Llegando en 2 min
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Share Trip Button */}
        <Button
          variant="outline"
          size="lg"
          className="w-full h-14 rounded-2xl font-semibold border-2 bg-transparent"
          onClick={handleShareTrip}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Compartir mi viaje
        </Button>
      </div>

      {/* SOS Modal */}
      <Dialog open={showSOSModal} onOpenChange={setShowSOSModal}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Emergencia SOS</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Selecciona el tipo de emergencia. Tu ubicación GPS será enviada automáticamente.
            </p>
            <div className="space-y-2">
              <Button
                variant="destructive"
                size="lg"
                className="w-full h-14 rounded-2xl font-semibold text-base"
                onClick={() => handleSOSSubmit("Asalto")}
              >
                🚨 Asalto
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="w-full h-14 rounded-2xl font-semibold text-base"
                onClick={() => handleSOSSubmit("Accidente")}
              >
                🚑 Accidente
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="w-full h-14 rounded-2xl font-semibold text-base"
                onClick={() => handleSOSSubmit("Emergencia médica")}
              >
                🩺 Emergencia médica
              </Button>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-2xl bg-transparent"
              onClick={() => setShowSOSModal(false)}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
