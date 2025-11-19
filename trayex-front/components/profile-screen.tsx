"use client";

import { useEffect, useMemo, useState } from "react";
import type { UserRole } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUser, getToken, saveUser } from "@/lib/session";
import { getMe } from "@/lib/api";

interface ProfileScreenProps {
  userRole: UserRole;
}

export function ProfileScreen({ userRole }: ProfileScreenProps) {
  const [user, setUser] = useState<any>(getUser());

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    getMe(token)
      .then((res) => {
        if (res?.user) {
          setUser(res.user);
          saveUser(res.user);
        }
      })
      .catch(() => { });
  }, []);

  const displayName = useMemo(() => {
    const full = user?.student?.fullName;
    if (full) return full;
    if (user?.email) return user.email;
    return user?.role || userRole || "Usuario";
  }, [user, userRole]);

  const bloodType = user?.student?.bloodType ?? "No registrado";
  const idNumber = user?.student?.idNumber ?? "No registrado";
  const university = user?.student?.university ?? "No registrado";

  const emergencyName = user?.student?.emergencyName ?? "";
  const emergencyContact = user?.student?.emergencyContact ?? "";

  const emergencyLabel =
    emergencyName || emergencyContact
      ? [emergencyName, emergencyContact].filter(Boolean).join(" - ")
      : "No registrado";

  return (
    <div className="relative z-10 min-h-[calc(100vh-80px)] flex flex-col px-5 pt-8 pb-6">
      <Card className="bg-white rounded-[32px] shadow-[0_20px_45px_rgba(0,0,0,0.28)] px-6 pt-6 pb-8 border-0 flex-1 flex flex-col">

        {/* NOMBRE SIN FOTO */}
        <div className="mb-6">
          <p className="text-lg font-semibold text-slate-900">{displayName}</p>
          <p className="text-[11px] text-slate-500">
            {`ID: ${idNumber}`} · Estudiante
          </p>
        </div>

        {/* CAMPOS */}
        <div className="space-y-5 flex-1 mt-2">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-600">Tipo de sangre</p>
            <div className="h-9 rounded-lg bg-slate-100/80 px-3 flex items-center text-[13px] text-slate-800">
              {bloodType}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-600">Cédula de identidad</p>
            <div className="h-9 rounded-lg bg-slate-100/80 px-3 flex items-center text-[13px] text-slate-800">
              {idNumber}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-600">Universidad</p>
            <div className="h-9 rounded-lg bg-slate-100/80 px-3 flex items-center text-[13px] text-slate-800">
              {university}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-600">Contacto de emergencia</p>
            <div className="h-9 rounded-lg bg-slate-100/80 px-3 flex items-center text-[13px] text-slate-800">
              {emergencyLabel}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button
            type="button"
            onClick={() => alert("Aquí iría la lógica de llamada")}
            className="w-full h-11 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-sm font-semibold tracking-wide"
          >
            Llamada de emergencia
          </Button>
        </div>
      </Card>
    </div>
  );
}
