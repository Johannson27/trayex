"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Bus, Mail, Lock } from "lucide-react";
import { login, getMe } from "@/lib/api";
import { saveToken, saveUser } from "@/lib/session";
import { useRouter } from "next/navigation";

interface LoginScreenProps {
  userRole: "student" | "driver" | "staff";
  onBack: () => void;
  onSuccess?: () => void;
}

export function LoginScreen({ userRole, onBack, onSuccess }: LoginScreenProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const remembered = localStorage.getItem("remember_email");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const subtitle = useMemo(
    () =>
      userRole === "student"
        ? "Accede con tu correo institucional"
        : userRole === "driver"
          ? "Accede con tus credenciales"
          : "Ingresa tus credenciales",
    [userRole]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!email.trim()) return setErr("Ingresa tu email");
    if (password.length < 8)
      return setErr("La contraseña debe tener al menos 8 caracteres");

    setLoading(true);

    try {
      const { token, user } = await login(email.trim(), password);
      saveToken(token);

      try {
        const me = await getMe();
        saveUser(me.user ?? user ?? {});
      } catch {
        saveUser(user ?? {});
      }

      if (rememberMe) localStorage.setItem("remember_email", email.trim());
      else localStorage.removeItem("remember_email");
      if (onSuccess) onSuccess();

    } catch (e: any) {
      const msg = e?.message ?? "Error al iniciar sesión";
      if (msg.toLowerCase().includes("credenciales"))
        setErr("Email o contraseña incorrecta");
      else setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      <Image
        src="/assets/bg-welcome.jpg"
        alt="Fondo login Trayex"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/40" />

      {/* contenido */}
      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-10 pb-8 max-w-md mx-auto">

        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            type="button"
            className="flex items-center gap-2 text-white/90 text-sm hover:text-white transition-colors"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 border border-white/30">
              <ArrowLeft className="w-4 h-4" />
            </span>
            <span className="font-medium">Volver</span>
          </button>

          <div className="flex items-center gap-2 text-white/80 text-xs">
            <Bus className="w-4 h-4" />
            <span>Iniciar sesión</span>
          </div>
        </header>

        {/* Título */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-white drop-shadow">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="mt-1 text-sm text-white/85">{subtitle}</p>
        </div>

        {/* Card formulario */}
        <div className="mt-2 flex-1">
          <div className="bg-white/95 rounded-[24px] px-5 py-6 shadow-2xl backdrop-blur-sm">
            <form onSubmit={handleLogin} className="space-y-6">

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Correo
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    placeholder="correo@ejemplo.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 rounded-2xl text-slate-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 rounded-2xl text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(c) => setRememberMe(Boolean(c))}
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-700">
                    Recordar correo
                  </Label>
                </div>

                <button className="text-xs text-orange-500 hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {err && (
                <div className="text-sm text-red-600 bg-red-100/70 rounded-lg p-2">
                  {err}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full font-semibold text-sm shadow-xl"
                style={{
                  background:
                    "linear-gradient(90deg, #FFC933 0%, #F6A33A 50%, #F27C3A 100%)",
                }}
              >
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </Button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
