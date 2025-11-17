"use client"

import { useEffect, useState } from "react"
import { Bell, RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface NotificationItem {
  id: string
  title: string
  description: string
  read: boolean
}

interface NotificationsScreenProps {
  onUpdateUnreadCount?: (count: number) => void
}

export function NotificationsScreen({
  onUpdateUnreadCount,
}: NotificationsScreenProps) {
  // 🔔 NOTIFICACIONES DE EJEMPLO (luego las cambias por las reales)
  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Tu ruta está por llegar!",
      description: "Toca para ver más detalles",
      read: false,
    },
    {
      id: "2",
      title: "Saldo bajo: Recargar",
      description: "Toca para ver más detalles",
      read: false,
    },
    {
      id: "3",
      title: "Cambio de ruta 28/10!",
      description: "Toca para ver más detalles",
      read: false,
    },
    {
      id: "4",
      title: "Advertencia de seguridad!",
      description: "Toca para ver más detalles",
      read: false,
    },
  ])

  // Avisar al Dashboard cuántas no leídas hay
  useEffect(() => {
    const unread = items.filter((n) => !n.read).length
    onUpdateUnreadCount?.(unread)
  }, [items, onUpdateUnreadCount])

  const handleReload = () => {
    // Aquí luego metes la lógica real de recarga
    // por ahora solo simulo que “refresca” manteniendo la lista
    console.log("Recargar notificaciones (TODO lógica real)")
  }

  const handleMarkAll = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleOpenNotification = (id: string) => {
    // Aquí después puedes abrir un detalle, navegar, etc.
    // Por ahora solo la marcamos como leída.
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  return (
    <div className="relative z-10 min-h-[calc(100vh-80px)] flex flex-col">
      {/* HEADER */}
      <header className="px-5 pt-7 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5" />
          <h1 className="text-xl font-semibold">Avisos</h1>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReload}
            className="flex-1 h-9 rounded-full bg-white/90 shadow-sm border border-white/40 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar
          </button>

          <button
            type="button"
            onClick={handleMarkAll}
            className="flex-1 h-9 rounded-full bg-[#E3E7FF] text-[#1E40AF] shadow-sm border border-white/40 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            Marcar todo
          </button>
        </div>
      </header>

      {/* LISTA DE TARJETAS */}
      <main className="px-5 pb-6 flex-1">
        {items.length === 0 ? (
          <div className="h-full flex items-start justify-center pt-10">
            <p className="text-sm text-white/80">No tienes avisos.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleOpenNotification(n.id)}
                className="w-full text-left"
              >
                <Card className="w-full rounded-full px-5 py-3 bg-white/95 shadow-[0_10px_25px_rgba(0,0,0,0.12)] border-0">
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold ${n.read ? "text-[#2563eb]" : "text-[#1d4ed8]"
                        }`}
                    >
                      {n.title}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      {n.description}
                    </span>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
