"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AlertTriangle, Clock, MapPin, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TripInProgressScreenProps {
  routeName: string
  onEndTrip: () => void
}

export function TripInProgressScreen({
  routeName,
  onEndTrip,
}: TripInProgressScreenProps) {
  const [remainingTime, setRemainingTime] = useState(10)
  const [progress, setProgress] = useState(30)
  const [showSOSModal, setShowSOSModal] = useState(false)

  // timer demo
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0))
      setProgress((prev) => Math.min(prev + 5, 100))
    }, 60_000)

    return () => clearInterval(timer)
  }, [])

  const handleSOSSubmit = (type: string) => {
    if (!navigator.geolocation) {
      alert(`Alerta de ${type} enviada (sin ubicación).`)
      setShowSOSModal(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("[Trayex] SOS:", {
          type,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        alert(
          `Alerta de ${type} enviada.\nUbicación compartida con autoridades.`
        )
        setShowSOSModal(false)
      },
      (err) => {
        console.error(err)
        alert(`Alerta de ${type} enviada (no se pudo obtener ubicación).`)
        setShowSOSModal(false)
      }
    )
  }

  const handleShareTrip = () => {
    if (!navigator.geolocation) {
      alert("No se pudo obtener la ubicación para compartir.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const url = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`

        if (navigator.share) {
          navigator
            .share({
              title: "Mi viaje en Trayex",
              text: `Estoy viajando en ${routeName}.`,
              url,
            })
            .catch((e) => console.error(e))
        } else {
          alert(`Comparte este enlace:\n${url}`)
        }
      },
      () => {
        alert("No se pudo obtener la ubicación para compartir.")
      }
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col px-5 pt-10 pb-4 text-white">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
          Estado del viaje
        </h1>

        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-white/10 border-white/60 text-xs font-medium px-4 h-9 hover:bg-white/20"
          onClick={onEndTrip}
        >
          Cambiar parada
        </Button>
      </header>

      {/* Card principal */}
      <Card className="bg-white rounded-[26px] px-6 pt-5 pb-6 shadow-[0_24px_40px_rgba(0,0,0,0.35)] text-slate-900">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-sm text-slate-500 mb-1">Abordo</p>
            <p className="text-xl font-semibold leading-tight">{routeName}</p>
            <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="w-3 h-3" />
              Tiempo restante: {remainingTime} minutos
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSOSModal(true)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#FFC933] text-slate-900 shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
          >
            SOS
          </button>
        </div>

        {/* progress */}
        <div className="mt-4">
          <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#2F62F4] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* texto A / B / precio (demo) */}
        <div className="mt-5 space-y-1 text-sm">
          <p className="font-semibold">A  Universidad Americana</p>
          <p className="font-semibold">B  Mercado Roberto Huembes</p>
          <p className="font-semibold">$  C$: 2.50</p>
        </div>
      </Card>

      {/* botón compartir viaje */}
      <Button
        type="button"
        onClick={handleShareTrip}
        className="mt-6 h-12 w-full rounded-full text-base font-semibold shadow-[0_18px_30px_rgba(0,0,0,0.35)] border-0 flex items-center justify-center gap-2"
        style={{
          background:
            "linear-gradient(90deg, #FFC933 0%, #F6A33A 50%, #F27C3A 100%)",
        }}
      >
        <Share2 className="w-5 h-5" />
        Compartir mi viaje
      </Button>

      {/* botones secundarios */}
      <div className="mt-5 space-y-3">
        <Button
          variant="outline"
          className="w-full h-11 rounded-full bg-white/85 text-[#2F62F4] border-[#2F62F4] flex items-center justify-start gap-3 px-5 text-sm font-medium"
          onClick={() => alert("Compartir mi ubicación (lógica luego)")}
        >
          <MapPin className="w-4 h-4" />
          Compartir mi ubicación
        </Button>

        <Button
          variant="outline"
          className="w-full h-11 rounded-full bg-white/85 text-[#2F62F4] border-[#2F62F4] flex items-center justify-start gap-3 px-5 text-sm font-medium"
          onClick={() => alert("Advertencias (lógica luego)")}
        >
          <AlertTriangle className="w-4 h-4" />
          Advertencias
        </Button>

        <Button
          variant="outline"
          className="w-full h-11 rounded-full bg-white/85 text-[#2F62F4] border-[#2F62F4] flex items-center justify-start gap-3 px-5 text-sm font-medium"
          onClick={() => alert("Protocolos Trayex (lógica luego)")}
        >
          <div className="w-4 h-4 relative">
            <Image
              src="/icons/icon-192.png"
              alt="Trayex"
              fill
              className="object-contain"
            />
          </div>
          Protocolos Trayex
        </Button>
      </div>

      {/* Modal SOS */}
      <Dialog open={showSOSModal} onOpenChange={setShowSOSModal}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Emergencia SOS
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Selecciona el tipo de emergencia. Tu ubicación GPS será enviada
              automáticamente.
            </p>
            <div className="space-y-2">
              <Button
                variant="destructive"
                size="lg"
                className="w-full h-12 rounded-2xl font-semibold text-base"
                onClick={() => handleSOSSubmit("Asalto")}
              >
                🚨 Asalto
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="w-full h-12 rounded-2xl font-semibold text-base"
                onClick={() => handleSOSSubmit("Accidente")}
              >
                🚑 Accidente
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="w-full h-12 rounded-2xl font-semibold text-base"
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
