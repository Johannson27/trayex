"use client";

import { useEffect, useMemo, useState } from "react";
import {
  User,
  MapPin,
  Phone,
  Shield,
  HelpCircle,
  MessageCircle,
  FileText,
  Bus,
  Star,
  Settings,
  LogOut,
  Edit,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { UserRole } from "@/app/page";

import { getToken, clearToken } from "@/lib/session";
import { getMyProfile, updateMyProfile } from "@/lib/api";

type ProfileScreenProps = {
  userRole: UserRole;
};

export function ProfileScreen({ userRole }: ProfileScreenProps) {
  const token = getToken();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // datos del backend
  const [user, setUser] = useState<{ id: string; email: string | null; phone: string | null; role: string } | null>(
    null
  );
  const [profile, setProfile] = useState<{
    fullName?: string | null;
    bloodType?: string | null;
    idNumber?: string | null;
    university?: string | null;
    emergencyName?: string | null;
    emergencyContact?: string | null;
  } | null>(null);

  // edición
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    bloodType: "",
    idNumber: "",
    university: "",
    emergencyName: "",
    emergencyContact: "",
  });

  // switches locales (mock)
  const [shareTrip, setShareTrip] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  // --- Paso B.1: hidratar nombre desde localStorage (fallback inmediato) ---
  const [displayName, setDisplayName] = useState("Usuario");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        const name =
          u?.student?.fullName?.trim() ||
          u?.fullName?.trim() ||
          u?.email ||
          "Usuario";
        setDisplayName(name);
      }
    } catch { }
  }, []);

  // Cargar perfil real desde API
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErr("No hay sesión");
      return;
    }
    (async () => {
      try {
        const res = await getMyProfile(token);
        setUser(res.user);
        setProfile(res.profile);
        setForm({
          fullName: res.profile?.fullName || "",
          bloodType: res.profile?.bloodType || "",
          idNumber: res.profile?.idNumber || "",
          university: res.profile?.university || "",
          emergencyName: res.profile?.emergencyName || "",
          emergencyContact: res.profile?.emergencyContact || "",
        });

        // Refresca nombre con datos de backend si están
        const newName =
          res.profile?.fullName?.trim() ||
          res.user?.email ||
          res.user?.role ||
          "Usuario";
        setDisplayName(newName);
      } catch (e: any) {
        setErr(e?.message ?? "No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Derivar rol real (arregla que siempre vieras conductor)
  const derivedRole: "student" | "driver" = useMemo(() => {
    if (userRole) return userRole;
    const r = user?.role;
    if (r === "DRIVER") return "driver";
    return "student";
  }, [userRole, user?.role]);

  async function saveProfile() {
    if (!token) return;
    setErr(null);
    try {
      const payload = {
        fullName: form.fullName || undefined,
        bloodType: form.bloodType || undefined,
        idNumber: form.idNumber || undefined,
        university: form.university || undefined,
        emergencyName: form.emergencyName || undefined,
        emergencyContact: form.emergencyContact || undefined,
      };
      const { profile: updated } = await updateMyProfile(token, payload);
      setProfile(updated);
      setEditing(false);

      const newName =
        updated?.fullName?.trim() ||
        user?.email ||
        "Usuario";
      setDisplayName(newName);

      // refresca cache local mínima
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          u.student = { ...(u.student ?? {}), fullName: updated?.fullName ?? null };
          localStorage.setItem("user", JSON.stringify(u));
        }
      } catch { }
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo guardar");
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }
  if (err) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <p className="text-sm text-red-600 bg-red-100/70 rounded-lg p-3">{err}</p>
        <Button
          className="mt-4 rounded-xl"
          onClick={() => {
            clearToken();
            location.reload();
          }}
        >
          Volver a iniciar sesión
        </Button>
      </div>
    );
  }

  // ========== VISTA ESTUDIANTE (con edición) ==========
  const renderStudentView = () => (
    <div className="flex-1 overflow-y-auto pb-6">
      {/* Header con datos reales + Paso B.2 botón Editar en header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 px-6 pt-8 pb-12 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center border-4 border-primary-foreground/30">
            <User className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-primary-foreground/80 text-sm">{profile?.university || "Universidad no definida"}</p>
            <p className="text-primary-foreground/60 text-xs mt-1">{user?.email || user?.phone || ""}</p>
          </div>
          <div className="ml-auto">
            {!editing ? (
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => setEditing(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar perfil
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" className="rounded-full" onClick={saveProfile}>
                  <Save className="w-4 h-4 mr-1" />
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      fullName: profile?.fullName || "",
                      bloodType: profile?.bloodType || "",
                      idNumber: profile?.idNumber || "",
                      university: profile?.university || "",
                      emergencyName: profile?.emergencyName || "",
                      emergencyContact: profile?.emergencyContact || "",
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* Datos personales */}
        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">Datos personales</h2>
            </div>
          </div>

          {!editing ? (
            <div className="grid grid-cols-1 gap-3">
              <Row label="Nombre completo" value={profile?.fullName || "—"} />
              <Row label="Universidad" value={profile?.university || "—"} />
              <Row label="Cédula" value={profile?.idNumber || "—"} />
              <Row label="Tipo de sangre" value={profile?.bloodType || "—"} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <Field label="Nombre completo" value={form.fullName} onChange={(v) => setForm((s) => ({ ...s, fullName: v }))} placeholder="Juan Pérez" />
              <Field label="Universidad" value={form.university} onChange={(v) => setForm((s) => ({ ...s, university: v }))} placeholder="Universidad Nacional" />
              <Field label="Cédula" value={form.idNumber} onChange={(v) => setForm((s) => ({ ...s, idNumber: v }))} placeholder="1234567890" />
              <Field label="Tipo de sangre" value={form.bloodType} onChange={(v) => setForm((s) => ({ ...s, bloodType: v }))} placeholder="O+" />
            </div>
          )}
        </Card>

        {/* Paradas favoritas (mock) */}
        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">Paradas favoritas</h2>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <div>
                <p className="font-medium text-sm">Campus Central</p>
                <p className="text-xs text-muted-foreground">Parada principal</p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                Favorita
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <div>
                <p className="font-medium text-sm">Av. Principal</p>
                <p className="text-xs text-muted-foreground">Cerca de casa</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Contacto de emergencia */}
        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="font-semibold text-foreground">Contacto de emergencia</h2>
            </div>
          </div>

          {!editing ? (
            <div className="space-y-3">
              {profile?.emergencyName || profile?.emergencyContact ? (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{profile?.emergencyName || "—"}</p>
                    <p className="text-xs text-muted-foreground">{profile?.emergencyContact || "—"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Parentesco: —</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay contacto de emergencia</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <Field label="Nombre de contacto" value={form.emergencyName} onChange={(v) => setForm((s) => ({ ...s, emergencyName: v }))} placeholder="María Pérez" />
              <Field label="Teléfono de emergencia" value={form.emergencyContact} onChange={(v) => setForm((s) => ({ ...s, emergencyContact: v }))} placeholder="+505 8888 8888" />
            </div>
          )}
        </Card>

        {/* Privacidad */}
        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-semibold text-foreground">Privacidad</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">Compartir viaje</p>
                <p className="text-xs text-muted-foreground">Permite que tus contactos vean tu ubicación</p>
              </div>
              <Switch checked={shareTrip} onCheckedChange={setShareTrip} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">Análisis de uso</p>
                <p className="text-xs text-muted-foreground">Ayúdanos a mejorar la app</p>
              </div>
              <Switch checked={analytics} onCheckedChange={setAnalytics} />
            </div>
          </div>
        </Card>

        {/* Logout */}
        <div className="space-y-2 pt-2">
          <Button variant="outline" className="w-full justify-start rounded-2xl h-auto py-3 bg-transparent">
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Configuración</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-2xl h-auto py-3 text-destructive hover:text-destructive"
            onClick={() => {
              clearToken();
              location.reload();
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDriverView = () => (
    <div className="flex-1 overflow-y-auto pb-6">
      {/* Header con nombre real + botón Editar (deshabilitado para conductor) */}
      <div className="bg-gradient-to-br from-primary to-primary/80 px-6 pt-8 pb-12 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center border-4 border-primary-foreground/30">
            <User className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <Badge className="mt-2 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              Conductor
            </Badge>
          </div>
          <div className="ml-auto">
            <Button size="sm" className="rounded-full opacity-60" disabled title="Edición disponible para estudiantes">
              <Edit className="w-4 h-4 mr-1" />
              Editar perfil
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* Mock de conductor (igual que tu versión) */}
        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bus className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Información del bus</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <p className="text-sm text-muted-foreground">Número de bus</p>
              <p className="font-bold text-lg text-primary">B-12</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <p className="text-sm text-muted-foreground">Marca del transporte</p>
              <p className="font-medium text-sm">TransUniversitario</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <p className="text-sm text-muted-foreground">Capacidad de pasajeros</p>
              <p className="font-medium text-sm">40 personas</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-semibold text-foreground">Detalles del vehículo</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <p className="text-sm text-muted-foreground">Placa</p>
              <p className="font-bold text-sm">ABC-1234</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <p className="text-sm text-muted-foreground">Modelo</p>
              <p className="font-medium text-sm">Mercedes-Benz Sprinter 2022</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Estado del viaje</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl border-2 border-accent/30">
              <div>
                <p className="font-bold text-sm text-foreground">Estado actual</p>
                <p className="text-xs text-muted-foreground mt-1">Última actualización: hace 2 min</p>
              </div>
              <Badge className="bg-accent text-accent-foreground">En camino</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-muted/50 rounded-2xl text-center">
                <p className="text-xs text-muted-foreground">Viajes hoy</p>
                <p className="font-bold text-lg text-primary">8</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-2xl text-center">
                <p className="text-xs text-muted-foreground">Pasajeros</p>
                <p className="font-bold text-lg text-primary">156</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-2xl text-center">
                <p className="text-xs text-muted-foreground">Horas</p>
                <p className="font-bold text-lg text-primary">6.5</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
            <h2 className="font-semibold text-foreground">Calificación</h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 rounded-2xl">
            <div>
              <p className="text-sm text-muted-foreground">Promedio general</p>
              <p className="text-xs text-muted-foreground mt-1">Basado en 234 calificaciones</p>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <p className="font-bold text-2xl text-foreground">4.8</p>
            </div>
          </div>
        </Card>

        <div className="space-y-2 pt-2">
          <Button variant="outline" className="w-full justify-start rounded-2xl h-auto py-3 bg-transparent">
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Configuración</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-2xl h-auto py-3 text-destructive hover:text-destructive"
            onClick={() => {
              clearToken();
              location.reload();
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return derivedRole === "student" ? renderStudentView() : renderDriverView();
}

/* ---------- UI helpers ---------- */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-sm">{value || "—"}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <input
        className="w-full rounded-2xl border-2 bg-background px-3 py-2 h-12 focus:border-primary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
