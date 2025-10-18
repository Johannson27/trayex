"use client"

import { useState } from "react"
import {
  Clock,
  Route,
  Shield,
  CreditCard,
  Megaphone,
  Star,
  Archive,
  MoreVertical,
  Filter,
  Settings,
  CheckCheck,
  ChevronRight,
  X,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type NoticeCategory = "arrival" | "route-change" | "security" | "balance" | "ad"

interface Notice {
  id: string
  title: string
  summary?: string
  category: NoticeCategory
  createdAt: string
  read: boolean
  pinned?: boolean
  payload?: {
    routeId?: string
    stopId?: string
    etaMin?: number
    balance?: number
    deeplink?: string
  }
}

const mockNotices: Notice[] = [
  {
    id: "1",
    title: "Tu bus llega en 5 minutos",
    summary: "Ruta 1 - Norte está próxima a tu parada favorita",
    category: "arrival",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    payload: { routeId: "route-1", stopId: "stop-campus", etaMin: 5 },
  },
  {
    id: "2",
    title: "Cambio temporal de ruta",
    summary: "Ruta 3 - Sur tiene desvío por obras en Av. Principal",
    category: "route-change",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    payload: { routeId: "route-3" },
  },
  {
    id: "3",
    title: "Alerta de seguridad: Lluvias fuertes",
    summary: "Se esperan lluvias intensas en la zona norte. Conduce con precaución.",
    category: "security",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "4",
    title: "Saldo bajo en tu cuenta",
    summary: "Te quedan S/ 3.50. Recarga para seguir viajando sin interrupciones.",
    category: "balance",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: false,
    payload: { balance: 3.5 },
  },
  {
    id: "5",
    title: "Recarga exitosa",
    summary: "Se acreditaron S/ 20.00 a tu cuenta. Nuevo saldo: S/ 23.50",
    category: "balance",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: true,
    payload: { balance: 23.5 },
  },
  {
    id: "6",
    title: "Promoción especial para estudiantes",
    summary: "50% de descuento en viajes nocturnos durante esta semana",
    category: "ad",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "7",
    title: "Incidente reportado en tu ruta",
    summary: "Se reportó un incidente menor en Ruta 2. Tiempo estimado de retraso: 10 min",
    category: "security",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "8",
    title: "Bus disponible en parada cercana",
    summary: "Ruta 4 - Este está a 2 minutos de tu ubicación actual",
    category: "arrival",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    payload: { routeId: "route-4", etaMin: 2 },
  },
  {
    id: "9",
    title: "Actualización de horarios",
    summary: "Nuevos horarios disponibles para rutas matutinas a partir del lunes",
    category: "route-change",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "10",
    title: "Recordatorio: Verifica tu saldo",
    summary: "Asegúrate de tener saldo suficiente para tus viajes de mañana",
    category: "balance",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
]

const categoryConfig = {
  arrival: {
    icon: Clock,
    label: "Llegada",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  "route-change": {
    icon: Route,
    label: "Cambio de ruta",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  security: {
    icon: Shield,
    label: "Seguridad",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  balance: {
    icon: CreditCard,
    label: "Saldo",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  ad: {
    icon: Megaphone,
    label: "Anuncio",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
}

function getRelativeTime(isoDate: string): string {
  const now = Date.now()
  const date = new Date(isoDate).getTime()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Ahora"
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  return `Hace ${diffDays}d`
}

type NotificationsScreenProps = {
  onUpdateUnreadCount?: (count: number) => void
}

export function NotificationsScreen({ onUpdateUnreadCount }: NotificationsScreenProps) {
  const [notices, setNotices] = useState<Notice[]>(mockNotices)
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [swipedNoticeId, setSwipedNoticeId] = useState<string | null>(null)
  const [pushEnabled, setPushEnabled] = useState(true)

  const unreadCount = notices.filter((n) => !n.read).length

  const handleMarkRead = (id: string, read: boolean) => {
    setNotices((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read } : n))
      const newUnreadCount = updated.filter((n) => !n.read).length
      onUpdateUnreadCount?.(newUnreadCount)
      return updated
    })
    setSwipedNoticeId(null)
  }

  const handleMarkAllRead = () => {
    setNotices((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      onUpdateUnreadCount?.(0)
      return updated
    })
  }

  const handleStar = (id: string) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)))
    setSwipedNoticeId(null)
  }

  const handleArchive = (id: string) => {
    setNotices((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      const newUnreadCount = updated.filter((n) => !n.read).length
      onUpdateUnreadCount?.(newUnreadCount)
      return updated
    })
    setSwipedNoticeId(null)
  }

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice)
    setIsDetailOpen(true)
    if (!notice.read) {
      handleMarkRead(notice.id, true)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleCTA = (notice: Notice) => {
    switch (notice.category) {
      case "arrival":
        console.log("[v0] Navigate to map with stop:", notice.payload?.stopId)
        break
      case "route-change":
        console.log("[v0] Navigate to routes with filter:", notice.payload?.routeId)
        break
      case "security":
        console.log("[v0] Open security protocol")
        break
      case "balance":
        console.log("[v0] Navigate to recharge")
        break
      case "ad":
        console.log("[v0] Open ad details")
        break
    }
    setIsDetailOpen(false)
  }

  const getCTALabel = (category: NoticeCategory): string => {
    switch (category) {
      case "arrival":
        return "Ver en mapa"
      case "route-change":
        return "Ver ruta"
      case "security":
        return "Abrir protocolo"
      case "balance":
        return "Recargar ahora"
      case "ad":
        return "Ver detalles"
    }
  }

  const getDetailDescription = (notice: Notice): string => {
    switch (notice.category) {
      case "arrival":
        return `El bus de ${notice.payload?.routeId || "tu ruta"} llegará a tu parada en aproximadamente ${notice.payload?.etaMin || 5} minutos. Prepárate para abordar y ten tu pase QR listo.`
      case "route-change":
        return `La ${notice.payload?.routeId || "ruta"} tiene un cambio temporal debido a obras en la vía. El recorrido se ha modificado para garantizar tu seguridad. Revisa el nuevo trazado en el mapa.`
      case "security":
        return `Se ha detectado una condición climática adversa en tu zona. Te recomendamos tomar precauciones adicionales. Si necesitas ayuda, usa el botón SOS en la pantalla de viaje.`
      case "balance":
        return notice.payload?.balance && notice.payload.balance < 5
          ? `Tu saldo actual es de S/ ${notice.payload.balance.toFixed(2)}. Te recomendamos recargar pronto para evitar inconvenientes en tus próximos viajes.`
          : `Se ha procesado exitosamente tu recarga. Tu nuevo saldo es de S/ ${notice.payload?.balance?.toFixed(2) || "0.00"}.`
      case "ad":
        return `Aprovecha esta promoción exclusiva para estudiantes. Válida durante toda la semana en horarios nocturnos (después de las 8 PM). No requiere código, se aplica automáticamente.`
      default:
        return notice.summary || ""
    }
  }

  if (isRefreshing) {
    return (
      <div className="flex-1 bg-background p-4 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Avisos</h1>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (notices.length === 0) {
    return (
      <div className="flex-1 bg-background flex flex-col items-center justify-center p-8">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Bell className="w-16 h-16 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Sin avisos por ahora</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Te notificaremos cuando haya novedades importantes
        </p>
        <Button variant="outline" className="rounded-full bg-transparent">
          <Settings className="w-4 h-4 mr-2" />
          Preferencias
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Avisos</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleMarkAllRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Marcar todo como leído
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Preferencias
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Pull to refresh indicator */}
      <div className="px-4 py-2 text-center">
        <button
          onClick={handleRefresh}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Desliza para actualizar
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {notices.map((notice) => {
          const config = categoryConfig[notice.category]
          const Icon = config.icon
          const isSwiped = swipedNoticeId === notice.id

          return (
            <div key={notice.id} className="relative">
              {/* Swipe Actions Background */}
              {isSwiped && (
                <div className="absolute inset-0 flex items-center justify-end gap-2 px-4 bg-muted rounded-2xl">
                  <button
                    onClick={() => handleMarkRead(notice.id, !notice.read)}
                    className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center"
                  >
                    <CheckCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleStar(notice.id)}
                    className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center"
                  >
                    <Star className={notice.pinned ? "fill-current" : ""} />
                  </button>
                  <button
                    onClick={() => handleArchive(notice.id)}
                    className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <Archive className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Notice Card */}
              <Card
                className={`relative transition-transform duration-200 cursor-pointer ${
                  isSwiped ? "-translate-x-44" : ""
                } ${!notice.read ? "border-l-4 border-l-primary bg-primary/5" : ""}`}
                onClick={() => handleNoticeClick(notice)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setSwipedNoticeId(isSwiped ? null : notice.id)
                }}
              >
                <div className="p-4">
                  <div className="flex gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-sm line-clamp-1">{notice.title}</h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {getRelativeTime(notice.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Tap para ver detalles</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                        {notice.pinned && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                      </div>
                    </div>
                    {!notice.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                  </div>
                </div>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
          <SheetHeader className="mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-xl mb-2">{selectedNotice?.title}</SheetTitle>
                {selectedNotice && (
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {categoryConfig[selectedNotice.category].label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedNotice.createdAt).toLocaleString("es-ES", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsDetailOpen(false)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          <div className="space-y-6">
            <div className="prose prose-sm">
              <p className="text-foreground leading-relaxed">
                {selectedNotice && getDetailDescription(selectedNotice)}
              </p>
            </div>

            {selectedNotice && (
              <Button size="lg" className="w-full rounded-2xl" onClick={() => handleCTA(selectedNotice)}>
                {getCTALabel(selectedNotice.category)}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Notificaciones push</p>
                    <p className="text-xs text-muted-foreground">Recibir avisos como este</p>
                  </div>
                </div>
                <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
              </div>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
