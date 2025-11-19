"use client";

import { useEffect, useState } from "react";
import { Bell, RefreshCw, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion"

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationAsRead,
} from "@/lib/api-notifications";
import { getToken } from "@/lib/session";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  channel: string;
  sentAt: string;
  read: boolean;
}

interface NotificationsScreenProps {
  onUpdateUnreadCount?: (count: number) => void;
}

export function NotificationsScreen({ onUpdateUnreadCount }: NotificationsScreenProps) {
  const token = getToken();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ======================
  // CARGAR NOTIFICACIONES REALES
  // ======================
  const loadNotifications = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const { notifications } = await fetchNotifications(token);
      setItems(notifications);
    } catch (e) {
      console.error("Error cargando notificaciones:", e);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Actualizar contador de no leídas
  useEffect(() => {
    const unread = items.filter((n) => !n.read).length;
    onUpdateUnreadCount?.(unread);
  }, [items]);

  // ======================
  // MARCAR UNA
  // ======================
  const handleOpenNotification = async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await markNotificationAsRead(id, token!);
    } catch (e) {
      console.log("Error marcando como leída", e);
    }
  };

  // ======================
  // MARCAR TODAS
  // ======================
  const handleMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await markAllNotificationsRead(token!);
    } catch (e) {
      console.log("Error marcando todas:", e);
    }
  };

  return (
    <div className="relative z-10 min-h-[calc(100vh-80px)] flex flex-col">
      {/* HEADER */}
      <header className="px-5 pt-7 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5" />
          <h1 className="text-xl font-semibold">Avisos</h1>
        </div>

        {/* BOTÓN DE ACTIVAR NOTIFICACIONES */}
        <button
          type="button"
          onClick={async () => {
            const perm = await Notification.requestPermission();
            if (perm === "granted") {
              alert("Notificaciones activadas 😊");
            } else {
              alert("Debes permitir notificaciones para recibir avisos.");
            }
          }}
          className="w-full h-9 rounded-full bg-blue-600 text-white shadow-sm flex items-center justify-center gap-2 text-sm font-medium mb-3"
        >
          Activar notificaciones 🔔
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadNotifications}
            className="flex-1 h-9 rounded-full bg-white/90 shadow-sm border border-white/40 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
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


      {/* LISTA */}
      <main className="px-5 pb-6 flex-1">
        {items.length === 0 ? (
          <div className="h-full flex items-start justify-center pt-10">
            <p className="text-sm text-white/80">
              {loading ? "Cargando..." : "No tienes avisos."}
            </p>
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
                      {n.body}
                    </span>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
