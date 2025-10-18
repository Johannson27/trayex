"use client"

import { useState, useEffect } from "react"
import { QrCode, Wallet, Clock, CreditCard, MapPin, TrendingUp, TrendingDown, Gift, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PassScreen() {
  const [qrValidTime, setQrValidTime] = useState(22) // seconds
  const [balance, setBalance] = useState(12.4)
  const [showRechargeModal, setShowRechargeModal] = useState(false)

  // Countdown timer for QR validity
  useEffect(() => {
    const timer = setInterval(() => {
      setQrValidTime((prev) => (prev > 0 ? prev - 1 : 30)) // Reset to 30 when reaches 0
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const tripHistory = [
    { id: 1, route: "Ruta 1 - Norte", amount: -1.5, type: "expense", date: "Hoy, 14:30" },
    { id: 2, route: "Ruta 3 - Centro", amount: -1.5, type: "expense", date: "Hoy, 09:15" },
    { id: 3, route: "Recarga en línea", amount: 20.0, type: "recharge", date: "Ayer, 18:00" },
    { id: 4, route: "Ruta 2 - Sur", amount: -1.5, type: "expense", date: "Ayer, 16:45" },
  ]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-background">
      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* Header */}
        <div className="pt-2 pb-4">
          <h1 className="text-2xl font-bold text-foreground">Trayex Pass</h1>
          <p className="text-sm text-muted-foreground">Tu pase digital para viajar</p>
        </div>

        {/* Dynamic QR Code Card */}
        <Card className="p-6 space-y-4 border-2 shadow-lg rounded-3xl bg-card animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Mi QR dinámico</h2>
            <Badge variant="secondary" className="rounded-full">
              <Clock className="w-3 h-3 mr-1" />
              Válido por {formatTime(qrValidTime)}
            </Badge>
          </div>

          {/* QR Code Display */}
          <div className="bg-white p-6 rounded-2xl flex items-center justify-center animate-in zoom-in duration-300">
            <div className="relative">
              {/* Simulated QR Code */}
              <div className="w-48 h-48 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <QrCode className="w-32 h-32 text-white" strokeWidth={1.5} />
              </div>
              {/* Animated border */}
              <div className="absolute inset-0 rounded-xl border-4 border-accent animate-pulse" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Mostrar para abordar</p>
            <p className="text-xs text-muted-foreground mt-1">El código se renueva automáticamente</p>
          </div>
        </Card>

        {/* Balance Card */}
        <Card className="p-6 space-y-4 border-2 shadow-lg rounded-3xl bg-gradient-to-br from-card to-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo disponible</p>
                <p className="text-3xl font-bold text-foreground">S/ {balance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-12 rounded-2xl font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => setShowRechargeModal(true)}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Recargar saldo
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            También puedes recargar en puntos físicos autorizados
          </p>
        </Card>

        {/* Trip History */}
        <Card className="p-6 space-y-4 border-2 shadow-lg rounded-3xl bg-card">
          <h2 className="text-lg font-semibold text-foreground">Historial de movimientos</h2>

          <div className="space-y-3">
            {tripHistory.map((trip) => (
              <div
                key={trip.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      trip.type === "expense" ? "bg-destructive/10" : "bg-success/10"
                    }`}
                  >
                    {trip.type === "expense" ? (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-success" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{trip.route}</p>
                    <p className="text-xs text-muted-foreground">{trip.date}</p>
                  </div>
                </div>
                <p className={`text-lg font-bold ${trip.type === "expense" ? "text-destructive" : "text-success"}`}>
                  {trip.amount > 0 ? "+" : ""}S/ {Math.abs(trip.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Physical Card Info */}
        <Card className="p-6 space-y-3 border-2 shadow-lg rounded-3xl bg-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Tarjeta física disponible</h3>
              <p className="text-xs text-muted-foreground">Respaldo sin batería con NFC/QR</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full rounded-xl bg-transparent">
            Solicitar tarjeta física
          </Button>
        </Card>

        {/* Promotions Banner */}
        <Card className="p-6 space-y-3 border-2 shadow-lg rounded-3xl bg-gradient-to-r from-accent/20 to-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <Gift className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Promociones activas</h3>
              <p className="text-xs text-muted-foreground">Recarga S/ 20 y obtén S/ 2 de bonificación</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="w-full rounded-xl">
            Ver todas las promociones
          </Button>
        </Card>
      </div>

      {/* Recharge Modal Overlay (Simple version) */}
      {showRechargeModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-in fade-in duration-200"
          onClick={() => setShowRechargeModal(false)}
        >
          <Card
            className="w-full max-w-md mx-auto rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-foreground">Recargar saldo</h2>
            <div className="space-y-3">
              <Button className="w-full h-12 rounded-2xl justify-start bg-transparent" variant="outline">
                <CreditCard className="w-5 h-5 mr-3" />
                Tarjeta de crédito/débito
              </Button>
              <Button className="w-full h-12 rounded-2xl justify-start bg-transparent" variant="outline">
                <Wallet className="w-5 h-5 mr-3" />
                Billetera digital
              </Button>
              <Button className="w-full h-12 rounded-2xl justify-start bg-transparent" variant="outline">
                <MapPin className="w-5 h-5 mr-3" />
                Punto físico autorizado
              </Button>
            </div>
            <Button variant="ghost" className="w-full rounded-2xl" onClick={() => setShowRechargeModal(false)}>
              Cancelar
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
