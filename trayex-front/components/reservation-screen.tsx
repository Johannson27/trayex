"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { CalendarClock, MapPin, Clock, Bus, XCircle, RefreshCw, QrCode, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMyReservations, cancelReservation } from "@/lib/api";
import { getToken } from "@/lib/session";
import type { ReservationStatus, ApiReservation, Reservation } from "@/types";

// Normaliza el status string del backend:
function coerceStatus(s: string): ReservationStatus {
    const allowed: ReservationStatus[] = [
        "PENDING", "CONFIRMED", "BOARDED", "CANCELLED", "COMPLETED", "NO_SHOW",
    ];
    return (allowed as string[]).includes(s) ? (s as ReservationStatus) : "PENDING";
}

// Transformar ApiReservation -> Reservation
function toReservation(r: ApiReservation): Reservation {
    return { ...r, status: coerceStatus(r.status) };
}

export function ReservationsScreen() {
    const token = getToken();
    const [items, setItems] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!token) {
            setErr("Inicia sesión para ver tus reservas.");
            setItems([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setErr(null);
        try {
            const { reservations } = await getMyReservations(token); // ← token OBLIGATORIO
            const safe: Reservation[] = (reservations ?? [])
                .filter((r: any) => r && r.id && r.timeslot && r.stop)
                .map((r: any) => ({ ...r, status: coerceStatus(r.status) }));
            setItems(safe);
        } catch (e: any) {
            setErr(e?.message ?? "No se pudieron cargar las reservas");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const canCancel = (s: ReservationStatus) => s === "PENDING" || s === "CONFIRMED";

    const badgeForStatus = (s: ReservationStatus) => {
        switch (s) {
            case "PENDING":
                return <Badge className="rounded-full" variant="secondary">Pendiente</Badge>;
            case "CONFIRMED":
                return <Badge className="rounded-full" variant="secondary">Confirmada</Badge>;
            case "BOARDED":
                return <Badge className="rounded-full" variant="outline">Abordado</Badge>;
            case "CANCELLED":
                return <Badge className="rounded-full" variant="outline">Cancelada</Badge>;
            case "COMPLETED":
                return <Badge className="rounded-full" variant="outline">Completada</Badge>;
            case "NO_SHOW":
                return <Badge className="rounded-full" variant="outline">No presentado</Badge>;
            default:
                return <Badge className="rounded-full" variant="outline">Desconocido</Badge>;
        }
    };

    const fmtDate = (iso?: string) => {
        if (!iso) return "—";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleString([], {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const onCancel = async (id: string) => {
        if (!token) return;
        try {
            setBusyId(id);
            await cancelReservation(token, id); // ← (token, id)
            await fetchData();
        } catch (e: any) {
            alert(e?.message ?? "No se pudo cancelar la reserva");
        } finally {
            setBusyId(null);
        }
    };
    const upcoming = useMemo(
        () =>
            items
                .slice()
                .sort((a, b) => (a?.timeslot?.startAt ?? "").localeCompare(b?.timeslot?.startAt ?? "")),
        [items]
    );

    return (
        <div className="flex-1 overflow-y-auto bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Mis reservas</h1>
                        <p className="text-sm text-muted-foreground">
                            {loading ? "Cargando..." : "Revisa y gestiona tus viajes"}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={fetchData}
                        disabled={loading}
                        title="Actualizar"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
                {err && <p className="mt-3 text-xs text-red-600 bg-red-100/60 rounded-md p-2">{err}</p>}
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {!loading && items.length === 0 && (
                    <Card className="p-6 rounded-3xl border-2 text-center space-y-3">
                        <HelpCircle className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Aún no tienes reservas activas.</p>
                        <p className="text-xs text-muted-foreground">
                            Ve a <span className="font-medium">Rutas</span> para crear una.
                        </p>
                    </Card>
                )}

                {upcoming.map((r, i) => {
                    const start = fmtDate(r?.timeslot?.startAt);
                    const end = fmtDate(r?.timeslot?.endAt);
                    const zoneName = r?.timeslot?.zone?.name ?? "Zona";

                    return (
                        <Card
                            key={r.id}
                            className="overflow-hidden border-2 rounded-3xl hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom"
                            style={{ animationDelay: `${i * 80}ms` }}
                        >
                            <div className="p-5 space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <CalendarClock className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground">{zoneName}</h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <span>Reserva #{r.id.slice(0, 6)}</span> {badgeForStatus(r.status)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* QR offline si existe */}
                                    {r.offlineToken ? (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <QrCode className="w-4 h-4" />
                                            Offline listo
                                        </div>
                                    ) : null}
                                </div>

                                {/* Body */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-foreground">
                                            Parada: <span className="font-medium">{r?.stop?.name ?? "—"}</span>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-foreground">
                                            {start} — {end}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Bus className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-foreground">
                                            Zona: <span className="font-medium">{zoneName}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-2 border-t border-border flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Creada: {fmtDate(r?.createdAt)}</span>

                                    {canCancel(r.status) ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-xl gap-1"
                                            onClick={() => onCancel(r.id)}
                                            disabled={busyId === r.id}
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {busyId === r.id ? "Cancelando..." : "Cancelar"}
                                        </Button>
                                    ) : (
                                        <Badge variant="outline" className="rounded-full">
                                            {badgeForStatus(r.status)}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
