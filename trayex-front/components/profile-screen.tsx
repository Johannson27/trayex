"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Menu } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { UserRole } from "@/types"
import { getUser, getToken, saveUser } from "@/lib/session"
import { getMe } from "@/lib/api"

interface ProfileScreenProps {
  userRole: UserRole
}

export function ProfileScreen({ userRole }: ProfileScreenProps) {
  const [user, setUser] = useState<any>(getUser())

  // Cargar usuario desde el backend si hay token
  useEffect(() => {
    const token = getToken()
    if (!token) return

    getMe(token)
      .then((res) => {
        if (res?.user) {
          setUser(res.user)
          saveUser(res.user)
        }
      })
      .catch(() => {
        // si falla, usamos lo que ya había en localStorage
      })
  }, [])

  const displayName = useMemo(() => {
    const full = user?.student?.fullName || user?.student?.fullname
    if (full && typeof full === "string" && full.trim().length > 0) return full
    if (user?.email) return user.email
    return user?.role || userRole || "Usuario"
  }, [user, userRole])

  // Campos extra (usa los nombres que pusiste al registrar)
  const bloodType =
    user?.student?.bloodType ??
    user?.bloodType ??
    "No registrado"

  const idNumber =
    user?.student?.idNumber ??
    user?.idNumber ??
    "No registrado"

  const university =
    user?.student?.university ??
    user?.university ??
    "No registrado"

  const emergencyName =
    user?.student?.emergencyName ??
    user?.emergencyName ??
    ""

  const emergencyContact =
    user?.student?.emergencyContact ??
    user?.emergencyContact ??
    ""

  const emergencyLabel =
    emergencyName || emergencyContact
      ? [emergencyName, emergencyContact].filter(Boolean).join(" - ")
      : "No registrado"

  // Foto: si tu backend trae avatar pon aquí la propiedad, si no, usamos un placeholder
  const avatarUrl =
    user?.student?.avatarUrl ||
    user?.avatarUrl ||
    "/assets/profile-placeholder.jpg" // crea este jpg si quieres que se vea igual que el diseño

  const handleEmergencyCall = () => {
    // Aquí luego metes la lógica real (tel: link, llamada nativa, etc.)
    alert("Aquí iría la lógica de 'Llamada de emergencia' 😉")
  }

  return (
    <div className="relative z-10 min-h-[calc(100vh-80px)] flex flex-col px-5 pt-8 pb-6">
      {/* CARD PRINCIPAL */}
      <Card className="bg-white rounded-[32px] shadow-[0_20px_45px_rgba(0,0,0,0.28)] px-6 pt-6 pb-8 border-0 flex-1 flex flex-col">
        {/* HEADER CON FOTO Y NOMBRE */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
              <Image
                src={avatarUrl}
                alt={displayName}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500">
                {`ID: ${idNumber !== "No registrado" ? idNumber : "No registrado"} · Estudiante`}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* CAMPOS DE INFO (compactos + más aire) */}
        <div className="space-y-5 flex-1 mt-2">

          {/* Tipo de sangre */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-600">Tipo de sangre</p>
            <div className="h-9 rounded-lg bg-slate-100/80 px-3 flex items-center text-[13px] text-slate-800">
              {bloodType}
            </div>
          </div>

          {/* Cédula */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-600">Cédula de identidad</p>
            <div className="h-9 rounded-lg bg-slate-100/80 px-3 flex items-center text-[13px] text-slate-800">
              {idNumber}
            </div>
          </div>

          {/* Universidad */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-600">Universidad</p>
            <div className="h-9 rounded-lg bg-slate-100/80 px-3 flex items-center text-[13px] text-slate-800">
              {university}
            </div>
          </div>

          {/* Contacto de emergencia */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-600">Contacto de emergencia</p>
            <div className="h-9 rounded-lg bg-slate-100/80 px-3 flex items-center text-[13px] text-slate-800">
              {emergencyLabel}
            </div>
          </div>

        </div>

        {/* BOTÓN LLAMADA DE EMERGENCIA */}
        <div className="mt-8">
          <Button
            type="button"
            onClick={handleEmergencyCall}
            className="w-full h-11 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-sm font-semibold tracking-wide"
          >
            Llamada de emergencia
          </Button>
        </div>
      </Card>
    </div>
  )
}
