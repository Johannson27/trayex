"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import TrayexQR from "@/components/TrayexQR";
import {
    Bus,
    QrCode as QrIcon,
    ArrowRight,
    Calendar,
    Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { getPassQR } from "@/lib/api";
import { getToken } from "@/lib/session";

export function FaresScreen({ setActiveNav }: { setActiveNav: any }) {
    const token = getToken();

    const [reservation, setReservation] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [qrValue, setQrValue] = useState<string | null>(null);
    const [showFullPass, setShowFullPass] = useState(false);

    useEffect(() => {
        const storedRes = localStorage.getItem("latestReservation");
        if (storedRes) setReservation(JSON.parse(storedRes));

        const storedHistory = localStorage.getItem("history");
        setHistory(storedHistory ? JSON.parse(storedHistory) : []);
    }, []);

    useEffect(() => {
        async function loadQR() {
            if (!token) return;

            try {
                const { qr } = await getPassQR(token);
                setQrValue(qr);
            } catch {
                setQrValue(null);
            }
        }
        loadQR();
    }, [token]);

    if (!reservation) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] text-white">
                No tienes reservas aún.
            </div>
        );
    }

    return (
        <div className="relative min-h-[calc(100vh-80px)] px-5 pt-8 pb-4">
            <Image
                src="/assets/bg-dashboard.jpg"
                alt="Fondo Trayex"
                fill
                priority
                className="object-cover -z-10"
            />

            <div className="relative z-10">

                {/* HEADER */}
                <div className="mb-4">
                    <h1 className="text-xl font-semibold text-white drop-shadow">
                        Pago
                    </h1>
                    <p className="text-xs text-white/80 drop-shadow">
                        Aquí está tu pase activo y tu historial.
                    </p>
                </div>

                {/* SALDO */}
                <Card className="rounded-3xl px-5 py-4 mb-4 shadow-[0_16px_40px_rgba(0,0,0,0.30)] border-none bg-white/98">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-slate-500">Saldo disponible</p>
                            <p className="text-2xl font-bold">C$ 172.50</p>
                            <p className="text-[11px] text-slate-400">
                                Usa tu saldo para pagar tus rutas automáticamente.
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <button
                                className="h-8 rounded-full px-4 text-xs font-semibold bg-slate-900 text-white"
                                onClick={() => alert("Lógica de recarga próximamente")}
                            >
                                Recargar
                            </button>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <Image src="/assets/tarjeta.png" width={14} height={14} alt="" />
                                <span>Tarjeta vinculada</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* PASE ACTIVO */}
                <Card className="rounded-3xl px-5 py-4 mb-5 shadow-[0_16px_40px_rgba(0,0,0,0.30)] border-none bg-white/98">
                    <div className="flex items-start justify-between gap-4">

                        <div className="flex-1 space-y-1">
                            <p className="text-[11px] text-slate-500">Pase para</p>

                            <p className="text-base font-semibold flex items-center gap-1">
                                Ruta {reservation.route}
                                <Badge className="rounded-full text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 border-none">
                                    Activo
                                </Badge>
                            </p>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <Clock className="w-3 h-3" />
                                <span>
                                    {new Date(reservation.timestamp).toLocaleTimeString(
                                        "es-NI",
                                        { hour: "numeric", minute: "2-digit" }
                                    )}
                                </span>
                            </div>

                            <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                                <p className="flex items-start gap-1.5">
                                    <span className="mt-[2px] text-xs">A</span>
                                    <span>{reservation.origin}</span>
                                </p>

                                <p className="flex items-start gap-1.5">
                                    <span className="mt-[2px] text-xs">B</span>
                                    <span>{reservation.destination}</span>
                                </p>

                                <p className="flex items-start gap-1.5">
                                    <span className="mt-[2px] text-xs">$</span>
                                    <span>{reservation.price}</span>
                                </p>
                            </div>

                            {!qrValue && (
                                <p className="text-[10px] mt-2 text-slate-400">
                                    Obteniendo QR…
                                </p>
                            )}
                        </div>

                        {/* SOLO QR (sin logo extra) */}
                        <div className="w-[92px] flex flex-col items-center gap-3">
                            <button
                                onClick={() => qrValue && setShowFullPass(true)}
                                className="w-[82px] h-[82px] rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center"
                            >
                                {qrValue ? (
                                    <TrayexQR value={qrValue} size={70} />
                                ) : (
                                    <div className="flex flex-col items-center text-[10px] text-slate-400">
                                        <QrIcon className="w-4 h-4 mb-1" />
                                        Obteniendo…
                                    </div>
                                )}
                            </button>

                            <button
                                className="text-[10px] text-blue-600 font-semibold flex items-center gap-1"
                                onClick={() => qrValue && setShowFullPass(true)}
                            >
                                Ver pase
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </Card>

                {/* HISTORIAL */}
                <Card className="rounded-3xl px-5 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)] border-none bg-white/98">
                    <p className="text-sm font-semibold mb-3">Historial</p>

                    {history.length === 0 && (
                        <p className="text-xs text-slate-500">Aún no tienes historial.</p>
                    )}

                    <div className="max-h-64 overflow-y-auto pr-2">
                        {history.map((h) => (
                            <div
                                key={h.id}
                                className="flex items-center justify-between py-2 border-b border-slate-100"
                            >
                                <div>
                                    <p className="text-xs font-semibold">Ruta {h.route}</p>

                                    <p className="text-[11px] text-slate-500">
                                        {h.origin} → {h.destination}
                                    </p>

                                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(h.timestamp).toLocaleDateString("es-NI")} •{" "}
                                        {new Date(h.timestamp).toLocaleTimeString("es-NI", {
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>

                                <p className="text-xs font-semibold text-rose-500">
                                    - {h.price}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* MODAL QR GRANDE */}
            {showFullPass && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center"
                    onClick={() => setShowFullPass(false)}
                >
                    <div
                        className="relative w-full max-w-md h-full max-h-[780px] bg-white/95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src="/assets/bg-dashboard.jpg"
                            alt="Fondo"
                            fill
                            className="object-cover"
                        />

                        <div className="relative z-10 h-full flex flex-col px-5 pt-6 pb-6">

                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white text-xl font-semibold">Pase</h2>

                                <button
                                    className="text-white text-sm bg-white/20 px-3 py-1 rounded-full"
                                    onClick={() => setShowFullPass(false)}
                                >
                                    Cerrar
                                </button>
                            </div>

                            <Card className="flex-1 rounded-[32px] px-6 py-6 bg-white/95 shadow-xl border-none">
                                <div className="flex justify-center mb-4">
                                    <TrayexQR value={qrValue || ""} size={190} />
                                </div>

                                <div className="text-[12px] text-slate-700 space-y-1">
                                    <p className="flex gap-2">
                                        <span className="font-semibold">A</span>
                                        {reservation.origin}
                                    </p>

                                    <p className="flex gap-2">
                                        <span className="font-semibold">B</span>
                                        {reservation.destination}
                                    </p>

                                    <p className="flex gap-2">
                                        <span className="font-semibold">$</span>
                                        {reservation.price}
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
