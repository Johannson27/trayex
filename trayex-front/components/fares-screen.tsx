"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import QRCode from "react-qr-code"
import {
    CreditCard,
    Bus,
    QrCode as QrIcon,
    ArrowRight,
    Calendar,
    Clock,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { getPassQR, rotatePassQR } from "@/lib/api"
import { getToken } from "@/lib/session"

type Payment = {
    id: string
    route: string
    description: string
    date: string
    time: string
    amount: string
}

const MOCK_BALANCE = "C$ 172.50"

const LAST_PASS = {
    route: "Ruta 164",
    time: "6:09 a. m.",
    from: "Universidad Americana",
    to: "Mercado Roberto Huembes",
    price: "C$ 2.50",
}

const MOCK_HISTORY: Payment[] = [
    {
        id: "1",
        route: "Ruta 164",
        description: "Pase completado",
        date: "Hoy",
        time: "6:09 a. m.",
        amount: "- C$ 2.50",
    },
    {
        id: "2",
        route: "Ruta 111",
        description: "Pase completado",
        date: "Ayer",
        time: "6:25 a. m.",
        amount: "- C$ 2.50",
    },
    {
        id: "3",
        route: "Ruta 06",
        description: "Pase completado",
        date: "Ayer",
        time: "6:39 a. m.",
        amount: "- C$ 2.50",
    },
]

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`
}

export function FaresScreen() {
    // ==== QR DINÁMICO (misma lógica que PassScreen) ====
    const token = getToken()
    const [qrValidTime, setQrValidTime] = useState(30)
    const [qrValue, setQrValue] = useState<string | null>(null)
    const [rotating, setRotating] = useState(false)
    const [showFullPass, setShowFullPass] = useState(false)

    const fetchFirstQR = useCallback(async () => {
        if (!token) return
        try {
            const { qr } = await getPassQR(token)
            setQrValue(qr)
            setQrValidTime(30)
        } catch {
            setQrValue(null)
        }
    }, [token])

    const rotateQR = useCallback(async () => {
        if (!token || rotating) return
        try {
            setRotating(true)
            const { qr } = await rotatePassQR(token)
            setQrValue(qr)
            setQrValidTime(30)
        } catch {
            // si falla, dejamos el anterior
        } finally {
            setRotating(false)
        }
    }, [token, rotating])

    useEffect(() => {
        fetchFirstQR()
    }, [fetchFirstQR])

    useEffect(() => {
        const t = setInterval(() => {
            setQrValidTime((prev) => {
                if (prev <= 1) {
                    rotateQR()
                    return 30
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(t)
    }, [rotateQR])

    const isExpiring = !!qrValue && qrValidTime <= 5

    // ==== UI ====
    return (
        <div className="relative min-h-[calc(100vh-80px)] px-5 pt-8 pb-4">
            {/* Fondo igual al dashboard */}
            <Image
                src="/assets/bg-dashboard.jpg"
                alt="Fondo Trayex"
                fill
                priority
                className="object-cover -z-10"
            />

            <div className="relative z-10">
                {/* Título */}
                <div className="mb-4">
                    <h1 className="text-xl font-semibold text-white drop-shadow">
                        Pago
                    </h1>
                    <p className="text-xs text-white/80 drop-shadow">
                        Revisa tu saldo, tu último pase y el historial de pagos.
                    </p>
                </div>

                {/* CARD SUPERIOR: saldo disponible */}
                <Card className="rounded-3xl px-5 py-4 mb-4 shadow-[0_16px_40px_rgba(0,0,0,0.30)] border-none bg-white/98">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-slate-500 font-medium">
                                Saldo disponible
                            </p>
                            <p className="text-2xl font-bold text-slate-900">
                                {MOCK_BALANCE}
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Usa tu saldo para pagar tus rutas automáticamente.
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Button
                                size="sm"
                                className="h-8 rounded-full px-4 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
                                type="button"
                                onClick={() => alert("Aquí va la lógica para recargar saldo")}
                            >
                                Recargar
                            </Button>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <CreditCard className="w-3 h-3" />
                                <span>Tarjeta vinculada</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* CARD MEDIO: último pase + QR (dinámico) */}
                <Card className="rounded-3xl px-5 py-4 mb-5 shadow-[0_16px_40px_rgba(0,0,0,0.30)] border-none bg-white/98">
                    <div className="flex items-start justify-between gap-4">
                        {/* info izquierda */}
                        <div className="flex-1 space-y-1">
                            <p className="text-[11px] text-slate-500 font-medium">
                                Pase para
                            </p>
                            <p className="text-base font-semibold text-slate-900 flex items-center gap-1">
                                {LAST_PASS.route}
                                <Badge className="rounded-full text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 border-none">
                                    Activo
                                </Badge>
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{LAST_PASS.time}</span>
                            </div>

                            <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                                <p className="flex items-start gap-1.5">
                                    <span className="mt-[2px] text-xs">A</span>
                                    <span>{LAST_PASS.from}</span>
                                </p>
                                <p className="flex items-start gap-1.5">
                                    <span className="mt-[2px] text-xs">B</span>
                                    <span>{LAST_PASS.to}</span>
                                </p>
                                <p className="flex items-start gap-1.5">
                                    <span className="mt-[2px] text-xs">$</span>
                                    <span>{LAST_PASS.price}</span>
                                </p>
                            </div>

                            {qrValue && (
                                <p className="mt-2 text-[10px] text-slate-400">
                                    QR dinámico · expira en {formatTime(qrValidTime)}
                                </p>
                            )}
                        </div>

                        {/* QR derecha (clicable) */}
                        <div className="w-[92px] flex flex-col items-center gap-2">
                            <button
                                type="button"
                                onClick={() => qrValue && setShowFullPass(true)}
                                className="w-[82px] h-[82px] rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden relative"
                            >
                                {qrValue ? (
                                    <>
                                        <QRCode value={qrValue} size={70} />
                                        {isExpiring && (
                                            <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400 animate-pulse pointer-events-none" />
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-[10px] text-slate-400">
                                        <QrIcon className="w-4 h-4 mb-1" />
                                        Obteniendo QR…
                                    </div>
                                )}
                            </button>
                            <button
                                type="button"
                                className="text-[10px] text-blue-600 font-semibold flex items-center gap-1"
                                onClick={() => qrValue && setShowFullPass(true)}
                            >
                                Ver pase
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </Card>

                {/* HISTORIAL DE PAGOS */}
                <Card className="rounded-3xl px-5 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)] border-none bg-white/98">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-slate-900">
                            Historial de pagos
                        </p>
                        <button
                            type="button"
                            className="text-[11px] text-blue-600 font-semibold flex items-center gap-1"
                            onClick={() => alert("Aquí podrías abrir un historial completo")}
                        >
                            Ver todo
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {MOCK_HISTORY.map((p) => (
                            <div
                                key={p.id}
                                className="flex items-center justify-between py-2 border-b last:border-b-0 border-slate-100"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Bus className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-semibold text-slate-900">
                                            {p.route}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {p.description}
                                        </p>
                                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{p.date}</span>
                                            <span className="mx-1">•</span>
                                            <span>{p.time}</span>
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs font-semibold text-rose-500">
                                    {p.amount}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* OVERLAY: Pase grande con mismo QR */}
            {showFullPass && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    onClick={() => setShowFullPass(false)}
                >
                    <div
                        className="relative w-full max-w-md h-full max-h-[760px] mx-auto rounded-none sm:rounded-3xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Fondo azul / ondas (mismo que dashboard) */}
                        <Image
                            src="/assets/bg-dashboard.jpg"
                            alt="Fondo Pase"
                            fill
                            className="object-cover"
                        />

                        {/* Contenido */}
                        <div className="relative z-10 flex flex-col h-full px-5 pt-6 pb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white text-xl font-semibold drop-shadow">
                                    Pase
                                </h2>
                                <button
                                    type="button"
                                    className="text-white text-sm px-3 py-1 rounded-full bg-white/20 hover:bg-white/30"
                                    onClick={() => setShowFullPass(false)}
                                >
                                    Cerrar
                                </button>
                            </div>

                            {/* Tarjeta blanca con el QR grande */}
                            <div className="flex-1 flex items-center justify-center">
                                <Card className="w-full rounded-[32px] px-6 pt-6 pb-6 bg-white/98 border-none shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
                                    {/* Logo arriba */}
                                    <div className="flex flex-col items-center gap-1 mb-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                                            <Image
                                                src="/icons/icon-192.png"
                                                alt="Trayex"
                                                width={40}
                                                height={40}
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                            Pasaje para {LAST_PASS.route}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {LAST_PASS.time} · ☀️
                                        </p>
                                    </div>

                                    {/* QR grande */}
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="bg-white p-3 rounded-2xl shadow-inner relative">
                                            {qrValue ? (
                                                <>
                                                    <QRCode value={qrValue} size={190} />
                                                    {isExpiring && (
                                                        <div className="absolute -inset-2 rounded-2xl border-4 border-yellow-400 animate-pulse pointer-events-none" />
                                                    )}
                                                </>
                                            ) : (
                                                <div className="w-[190px] h-[190px] flex flex-col items-center justify-center text-slate-400">
                                                    <QrIcon className="w-10 h-10 mb-2" />
                                                    <p className="text-xs">Obteniendo código…</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info A / B */}
                                    <div className="space-y-1 text-[12px] text-slate-700">
                                        <p className="flex items-start gap-2">
                                            <span className="font-semibold">A</span>
                                            <span>{LAST_PASS.from}</span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <span className="font-semibold">B</span>
                                            <span>{LAST_PASS.to}</span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <span className="font-semibold">$</span>
                                            <span>{LAST_PASS.price}</span>
                                        </p>
                                    </div>

                                    {/* Indicador verde abajo derecha */}
                                    <div className="mt-4 flex justify-end">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
