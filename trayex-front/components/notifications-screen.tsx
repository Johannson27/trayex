// src/components/notifications-screen.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Bell, CheckCheck, Check, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type UiNotification,
} from "@/lib/api";
import { getToken } from "@/lib/session";

type Props = {
  onUpdateUnreadCount?: (n: number) => void;
};

export function NotificationsScreen({ onUpdateUnreadCount }: Props) {
  const token = getToken();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<UiNotification[]>([]);
  const [markingAll, setMarkingAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  // propaga el contador a Dashboard
  useEffect(() => {
    onUpdateUnreadCount?.(unread);
  }, [unread, onUpdateUnreadCount]);

  const fetchList = useCallback(async () => {
    setErr(null);
    if (!token) {
      setLoading(false);
      setErr("Debes iniciar sesión");
      return;
    }
    try {
      setLoading(true);
      const { notifications } = await getMyNotifications(token);
      setItems(notifications ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "No se pudieron cargar los avisos");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const reload = async () => {
    if (!token) return;
    try {
      setRefreshing(true);
      await fetchList();
    } finally {
      setRefreshing(false);
    }
  };

  const markOne = async (id: string) => {
    if (!token) return;
    try {
      // optimista
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      await markNotificationRead(token, id);
    } catch (e: any) {
      // revert si falla
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      setErr(e?.message ?? "No se pudo marcar como leído");
    }
  };

  const markAll = async () => {
    if (!token) return;
    try {
      setMarkingAll(true);
      // optimista
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      await markAllNotificationsRead(token);
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo marcar todo como leído");
      // recargar estado real desde el servidor si algo falla
      fetchList();
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-4 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Avisos</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2"
              onClick={reload}
              disabled={refreshing}
              title="Recargar"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Cargando…" : "Recargar"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2"
              onClick={markAll}
              disabled={markingAll || unread === 0}
              title="Marcar todo como leído"
            >
              <CheckCheck className="w-4 h-4" />
              {markingAll ? "Marcando…" : "Marcar todo"}
            </Button>
          </div>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
        {err && <p className="text-sm text-red-600 bg-red-100/60 p-2 rounded-lg">{err}</p>}

        {!loading && items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">No tienes avisos.</p>
        )}

        <div className="space-y-3">
          {items.map((n) => (
            <Card
              key={n.id}
              className={`p-4 rounded-2xl border-2 ${n.read ? "opacity-75" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  {n.sentAt && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(n.sentAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <Button
                  variant={n.read ? "outline" : "default"}
                  size="icon"
                  className="rounded-full"
                  onClick={() => markOne(n.id)}
                  disabled={n.read}
                  title={n.read ? "Leído" : "Marcar como leído"}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
