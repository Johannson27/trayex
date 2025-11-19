"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Bus,
  User,
  Mail,
  Lock,
  Phone,
  Droplet,
  CreditCard,
  Building2,
} from "lucide-react"
import { register, getMe } from "@/lib/api"
import { saveToken, saveUser } from "@/lib/session"
import { UNIVERSITIES_NI } from "@/lib/universities-ni"

interface RegisterStudentScreenProps {
  onBack: () => void
  onSuccess?: () => void
}

export function RegisterStudentScreen({
  onBack,
  onSuccess,
}: RegisterStudentScreenProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    bloodType: "",
    idNumber: "",
    university: "",
    emergencyContact: "",
    emergencyName: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)

    if (step === 1) {
      if (!formData.fullName.trim())
        return setErr("Ingresa tu nombre completo")
      if (!formData.email) return setErr("Ingresa tu correo institucional")
      if (formData.password.length < 8)
        return setErr("La contraseña debe tener al menos 8 caracteres")
      if (formData.password !== formData.confirmPassword)
        return setErr("Las contraseñas no coinciden")

      setStep(2)
      return
    }

    // Paso 2: registrar en backend con campos extra
    setLoading(true)
    try {
      const { token, user } = await register(
        formData.email,
        formData.password,
        formData.fullName.trim(),
        {
          bloodType: formData.bloodType || undefined,
          idNumber: formData.idNumber || undefined,
          university: formData.university || undefined,
          emergencyName: formData.emergencyName || undefined,
          emergencyContact: formData.emergencyContact || undefined,
        }
      )

      // Guarda token + user
      saveToken ? saveToken(token) : localStorage.setItem("token", token)

      try {
        const me = await getMe(token)
        saveUser
          ? saveUser(me.user)
          : localStorage.setItem("user", JSON.stringify(me.user))
      } catch {
        saveUser
          ? saveUser(user)
          : localStorage.setItem("user", JSON.stringify(user))
      }

      onSuccess?.() // page.tsx te lleva a onboarding
    } catch (e: any) {
      const msg = e?.message ?? "No se pudo crear la cuenta"
      if (msg.includes("registrado") || msg.toLowerCase().includes("already")) {
        setErr("Este email ya está registrado")
      } else {
        setErr(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      {/* Fondo igual que el Figma de registro */}
      <Image
        src="/assets/bg-register-student.jpg"
        alt="Registro estudiante Trayex"
        fill
        priority
        className="object-cover"
      />

      {/* Contenido */}
      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-8 pb-8 max-w-md mx-auto text-white">
        {/* Header sobre el fondo */}
        <header className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={step === 2 ? () => setStep(1) : onBack}
            className="p-2 text-white hover:opacity-80 active:translate-x-[-1px] transition"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2 text-xs text-white/80">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
            <span>Registro Estudiante</span>
          </div>
        </header>

        <div className="mb-3">
          <h1 className="text-xl font-semibold drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
            {step === 1 ? "Crear tu cuenta" : "Datos de emergencia"}
          </h1>
          <p className="mt-1 text-sm text-white/85">
            {step === 1
              ? "Completa tu información básica"
              : "Estos datos nos ayudarán en caso de emergencia"}
          </p>
        </div>

        {/* Card del formulario */}
        <div className="mt-2 flex-1">
          <div className="bg-white/96 rounded-[24px] px-5 py-6 shadow-[0_20px_45px_rgba(0,0,0,0.55)] backdrop-blur-sm">
            {/* Progreso */}
            <div className="flex gap-2 mb-5">
              <div
                className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-[#F6A33A]" : "bg-slate-200"
                  }`}
              />
              <div
                className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-[#F6A33A]" : "bg-slate-200"
                  }`}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullName"
                      className="text-sm font-medium text-slate-800"
                    >
                      Nombre completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Juan Pérez"
                        value={formData.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        className="pl-11 h-11 rounded-2xl border border-slate-200 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A] text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-800"
                    >
                      Correo institucional
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="estudiante@universidad.edu"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="pl-11 h-11 rounded-2xl border border-slate-200 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A] text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-800"
                    >
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) =>
                          updateField("password", e.target.value)
                        }
                        className="pl-11 h-11 rounded-2xl border border-slate-200 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A] text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-slate-800"
                    >
                      Confirmar contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          updateField("confirmPassword", e.target.value)
                        }
                        className="pl-11 h-11 rounded-2xl border border-slate-200 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A] text-sm"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="bloodType"
                      className="text-sm font-medium text-slate-800"
                    >
                      Tipo de sangre
                    </Label>
                    <div className="relative">
                      <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <Select
                        value={formData.bloodType}
                        onValueChange={(value) =>
                          updateField("bloodType", value)
                        }
                      >
                        <SelectTrigger
                          className="pl-11 h-11 rounded-2xl border border-slate-200 text-slate-700 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A]"
                        >
                          <SelectValue placeholder="Selecciona tu tipo de sangre" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="idNumber"
                      className="text-sm font-medium text-slate-800"
                    >
                      Cédula de identidad
                    </Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="idNumber"
                        type="text"
                        placeholder="1234567890"
                        value={formData.idNumber}
                        onChange={(e) =>
                          updateField("idNumber", e.target.value)
                        }
                        className="pl-11 h-11 rounded-2xl border border-slate-200 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A] text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="university"
                      className="text-sm font-medium text-slate-800"
                    >
                      Universidad
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <Select
                        value={formData.university}
                        onValueChange={(value) =>
                          updateField("university", value)
                        }
                      >
                        <SelectTrigger
                          className="pl-11 h-11 rounded-2xl border border-slate-200 text-slate-700 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A]"
                        >
                          <SelectValue
                            placeholder="Selecciona tu universidad"
                            className="truncate"
                          />
                        </SelectTrigger>

                        <SelectContent className="max-h-64">
                          {UNIVERSITIES_NI.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="emergencyName"
                      className="text-sm font-medium text-slate-800"
                    >
                      Nombre de contacto de emergencia
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="emergencyName"
                        type="text"
                        placeholder="María Pérez"
                        value={formData.emergencyName}
                        onChange={(e) =>
                          updateField("emergencyName", e.target.value)
                        }
                        className="pl-11 h-11 rounded-2xl border border-slate-200 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A] text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="emergencyContact"
                      className="text-sm font-medium text-slate-800"
                    >
                      Teléfono de emergencia
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="emergencyContact"
                        type="tel"
                        placeholder="+505 8888 8888"
                        value={formData.emergencyContact}
                        onChange={(e) =>
                          updateField("emergencyContact", e.target.value)
                        }
                        className="pl-11 h-11 rounded-2xl border border-slate-200 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A] text-sm"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {err && (
                <div className="text-sm text-red-600 bg-red-100/70 rounded-xl p-3">
                  {err}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full h-11 rounded-full text-sm font-semibold shadow-[0_12px_28px_rgba(0,0,0,0.35)] transition-all duration-200 hover:brightness-110 hover:translate-y-[1px] active:translate-y-[2px]"
                style={{
                  background:
                    "linear-gradient(90deg, #FFC933 0%, #F6A33A 50%, #F27C3A 100%)",
                }}
                disabled={loading}
              >
                {loading
                  ? "Procesando..."
                  : step === 1
                    ? "Siguiente"
                    : "Crear cuenta"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
