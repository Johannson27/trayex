"use client";

import { useEffect, useState, useCallback } from "react";
import QRCode from "react-qr-code";

import { QrCode as QrIcon, Wallet, Clock, CreditCard, MapPin, TrendingUp, TrendingDown, Gift, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getPassQR, rotatePassQR, getMyReservations, cancelReservation } from "@/lib/api";
import { getToken } from "@/lib/session";
import type { Reservation } from "@/types";

// Tipado simple alineado al API (status es string en la respuesta)
type ReservationRow = {
  id: string;
  status: string; // <- string aquí (no uses ReservationStatus)
  offlineToken?: string | null;
  createdAt: string;
  timeslot: {
    id: string;
    startAt: string;
    endAt: string;
    zoneId: string;
    zone: { name: string };
  };
  stop: { id: string; name: string };
};

export function PassScreen() {
  // ===== QR Dinámico =====
  const [qrValidTime, setQrValidTime] = useState(30);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);

  // ===== Saldo + Recarga (UI) =====
  const [balance, setBalance] = useState(12.4);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // ===== Reservas =====
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);
  const [errRes, setErrRes] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const token = getToken();

  // Obtener primer QR
  const fetchFirstQR = useCallback(async () => {
    if (!token) return;
    try {
      const { qr } = await getPassQR(token);
      setQrValue(qr);
      setQrValidTime(30);
    } catch {
      setQrValue(null);
    }
  }, [token]);

  // Rotar QR
  const rotateQR = useCallback(async () => {
    if (!token || rotating) return;
    try {
      setRotating(true);
      const { qr } = await rotatePassQR(token);
      setQrValue(qr);
      setQrValidTime(30);
    } catch {
      // mantiene anterior si falla
    } finally {
      setRotating(false);
    }
  }, [token, rotating]);

  // Load primer QR al montar
  useEffect(() => {
    fetchFirstQR();
  }, [fetchFirstQR]);

  // Countdown + rotación cada 30s
  useEffect(() => {
    const t = setInterval(() => {
      setQrValidTime((prev) => {
        if (prev <= 1) {
          rotateQR();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [rotateQR]);

  // Cargar reservas
  const loadReservations = useCallback(async () => {
    if (!token) return;
    setLoadingRes(true);
    setErrRes(null);
    try {
      const { reservations } = await getMyReservations(token); // ← token OBLIGATORIO
      setReservations(reservations as ReservationRow[]);
    } catch (e: any) {
      setErrRes(e?.message ?? "No se pudieron cargar tus reservas");
    } finally {
      setLoadingRes(false);
    }
  }, [token]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const onCancelReservation = async (id: string) => {
    if (!token) return;
    try {
      setCancellingId(id);
      await cancelReservation(token, id); // ← (token, id)
      await loadReservations();
    } catch (e: any) {
      alert(e?.message ?? "No se pudo cancelar la reserva");
    } finally {
      setCancellingId(null);
    }
  };

  // Mock de movimientos
  const tripHistory = [
    { id: 1, route: "Ruta 1 - Norte", amount: -1.5, type: "expense", date: "Hoy, 14:30" },
    { id: 2, route: "Ruta 3 - Centro", amount: -1.5, type: "expense", date: "Hoy, 09:15" },
    { id: 3, route: "Recarga en línea", amount: 20.0, type: "recharge", date: "Ayer, 18:00" },
    { id: 4, route: "Ruta 2 - Sur", amount: -1.5, type: "expense", date: "Ayer, 16:45" },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isExpiring = !!qrValue && qrValidTime <= 5;

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-background">
      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* Header */}
        <div className="pt-2 pb-4">
          <h1 className="text-2xl font-bold text-foreground">Trayex Pass</h1>
          <p className="text-sm text-muted-foreground">Tu pase digital para viajar</p>
        </div>

        {/* QR Dinámico */}
        <Card className="p-6 space-y-4 border-2 shadow-lg rounded-3xl bg-card animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Mi QR dinámico</h2>
            <Badge variant="secondary" className="rounded-full">
              <Clock className="w-3 h-3 mr-1" />
              {qrValue ? `Válido por ${formatTime(qrValidTime)}` : "Generando..."}
            </Badge>
          </div>

          <div className="bg-white p-6 rounded-2xl flex items-center justify-center min-h-[220px]">
            {qrValue ? (
              <div className="relative">
                <QRCode value={qrValue} size={192} />
                {isExpiring && (
                  <div className="absolute -inset-3 rounded-xl border-4 border-yellow-400 animate-pulse pointer-events-none" />
                )}
              </div>
            ) : (
              <div className="text-center space-y-2 text-muted-foreground">
                <QrIcon className="w-10 h-10 mx-auto animate-pulse" />
                <p className="text-xs">Obteniendo código...</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={rotateQR}
              disabled={!qrValue || rotating}
            >
              {rotating ? "Rotando..." : "Rotar ahora"}
            </Button>
            <p className="text-xs text-muted-foreground">Se regenera automáticamente cada 30s</p>
          </div>
        </Card>

        {/* Saldo */}
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
          <p className="text-xs text-center text-muted-foreground">También puedes recargar en puntos físicos autorizados</p>
        </Card>

        {/* Mis reservas (futuras) */}
        <Card className="p-6 space-y-4 border-2 shadow-lg rounded-3xl bg-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Mis reservas</h2>
            {loadingRes && <span className="text-xs text-muted-foreground">Cargando...</span>}
          </div>

          {errRes && (
            <div className="text-xs text-red-600 bg-red-100/70 rounded-xl p-2">{errRes}</div>
          )}

          {reservations.length === 0 && !loadingRes && (
            <p className="text-sm text-muted-foreground">No tienes reservas próximas.</p>
          )}

          <div className="space-y-3">
            {reservations.map((r) => {
              const start = new Date(r.timeslot.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const end = new Date(r.timeslot.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const date = new Date(r.timeslot.startAt).toLocaleDateString();

              return (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.stop.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.timeslot.zone.name} • {date} • {start}–{end}
                      </p>
                      <p className="text-xs">
                        <Badge variant="outline" className="rounded-full mt-1">{r.status}</Badge>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => onCancelReservation(r.id)}
                    disabled={cancellingId === r.id}
                  >
                    {cancellingId === r.id ? "Cancelando..." : "Cancelar"}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Historial / tarjetas / promos… (igual que tenías) */}
        <Card className="p-6 space-y-3 border-2 shadow-lg rounded-3xl bg-card">
          <h2 className="text-lg font-semibold text-foreground">Historial de movimientos</h2>
          <div className="space-y-3">
            {[
              { id: 1, route: "Ruta 1 - Norte", amount: -1.5, type: "expense", date: "Hoy, 14:30" },
              { id: 2, route: "Ruta 3 - Centro", amount: -1.5, type: "expense", date: "Hoy, 09:15" },
              { id: 3, route: "Recarga en línea", amount: 20.0, type: "recharge", date: "Ayer, 18:00" },
              { id: 4, route: "Ruta 2 - Sur", amount: -1.5, type: "expense", date: "Ayer, 16:45" },
            ].map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trip.type === "expense" ? "bg-destructive/10" : "bg-success/10"}`}>
                    {trip.type === "expense" ? <TrendingDown className="w-5 h-5 text-destructive" /> : <TrendingUp className="w-5 h-5 text-success" />}
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

      {/* Modal de recarga */}
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
  );
}
