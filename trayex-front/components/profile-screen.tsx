// src/components/profile-screen.tsx
"use client";

import { useEffect, useState } from "react";
import { User, Building2, Droplet, Phone, CreditCard, Save, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyProfile, updateMyProfile } from "@/lib/api";
import { getToken, clearAllAuth } from "@/lib/session";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/app/app/page";

type Props = { userRole: UserRole };

const UNIVERSIDADES_NI = [
  "Universidad Americana (UAM)",
  "Universidad Centroamericana (UCA)",
  "Universidad Nacional Autónoma de Nicaragua (UNAN-Managua)",
  "UNAN-León",
  "Universidad Nacional de Ingeniería (UNI)",
  "Universidad Católica Redemptoris Mater (UNICA)",
  "Universidad Politécnica de Nicaragua (UPOLI)",
  "Universidad Agraria (UNA)",
  "Universidad de Ciencias Comerciales (UCC)",
  "Universidad Paulo Freire (UPF)",
  "Universidad Martín Lutero (UML)",
  "Universidad Thomas More",
  "Universidad Evangélica Nicaragüense (UENIC)",
];

export function ProfileScreen({ userRole }: Props) {
  const router = useRouter();
  const token = getToken();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [university, setUniversity] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // --- LOGOUT ---
  // dentro de ProfileScreen
  const handleLogout = () => {
    clearAllAuth();
    // recarga dura para limpiar cualquier estado en memoria
    window.location.href = "/";
  };


  // --- FETCH PERFIL ---
  useEffect(() => {
    (async () => {
      setErr(null);

      if (!token) {
        setErr("Debes iniciar sesión");
        setLoading(false); // evita quedarse en “Cargando…”
        return;
      }

      try {
        setLoading(true);
        const { profile } = await getMyProfile(token);
        if (profile) {
          setFullName(profile.fullName ?? profile.fullname ?? "");
          setBloodType(profile.bloodType ?? "");
          setIdNumber(profile.idNumber ?? "");
          setUniversity(profile.university ?? "");
          setEmergencyName(profile.emergencyName ?? "");
          setEmergencyContact(profile.emergencyContact ?? "");
        }
      } catch (e: any) {
        setErr(e?.message ?? "No se pudo cargar tu perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      await updateMyProfile(token, {
        fullName,
        bloodType,
        idNumber,
        university,
        emergencyName,
        emergencyContact,
      });
      setOk("Perfil actualizado");
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* Header con Salir */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Mi Perfil</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{userRole ?? "usuario"}</span>
            <Button variant="outline" className="rounded-xl gap-2" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="w-4 h-4" />
              Salir
            </Button>
          </div>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
        {err && <p className="text-sm text-red-600 bg-red-100/60 p-2 rounded-lg">{err}</p>}
        {ok && <p className="text-sm text-green-700 bg-green-100/60 p-2 rounded-lg">{ok}</p>}

        {!loading && (
          <Card className="p-5 rounded-3xl border-2 space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label className="text-sm">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-10 h-12 rounded-xl"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Cédula */}
            <div className="space-y-2">
              <Label className="text-sm">Cédula</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-10 h-12 rounded-xl"
                  placeholder="001-XXXXXX-0000X"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Tipo de sangre */}
            <div className="space-y-2">
              <Label className="text-sm">Tipo de sangre</Label>
              <div className="relative">
                <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  className="w-full border rounded-xl p-2 h-12 bg-background pl-10"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                >
                  <option value="">Selecciona</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Universidad */}
            <div className="space-y-2">
              <Label className="text-sm">Universidad</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  className="w-full border rounded-xl p-2 h-12 bg-background pl-10"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                >
                  <option value="">Selecciona tu universidad</option>
                  {UNIVERSIDADES_NI.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contactos de emergencia */}
            <div className="space-y-2">
              <Label className="text-sm">Contacto de emergencia — nombre</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-10 h-12 rounded-xl"
                  placeholder="María Pérez"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Contacto de emergencia — teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-10 h-12 rounded-xl"
                  placeholder="+505 8888 8888"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                />
              </div>
            </div>

            <Button className="w-full h-12 rounded-xl gap-2" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
