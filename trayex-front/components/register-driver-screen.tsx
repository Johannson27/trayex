"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  ArrowRight,
  Bus,
  User,
  Mail,
  Lock,
  Phone,
  Car,
  FileText,
  Upload,
} from "lucide-react"

interface RegisterDriverScreenProps {
  onBack: () => void
  onSuccess?: () => void
}

export function RegisterDriverScreen({
  onBack,
  onSuccess,
}: RegisterDriverScreenProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    busNumber: "",
    brand: "",
    capacity: "",
    plate: "",
    license: null as File | null,
    idCard: null as File | null,
    circulation: null as File | null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      console.log("Register driver:", formData)
      onSuccess?.()
    }
  }

  const updateField = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: string, file: File | null) => {
    updateField(field, file)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      {/* Reusamos el mismo fondo de registro */}
      <Image
        src="/assets/bg-register-student.jpg"
        alt="Registro conductor Trayex"
        fill
        priority
        className="object-cover"
      />

      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-8 pb-8 max-w-md mx-auto text-white">
        {/* Header */}
        <header className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={step === 1 ? onBack : () => setStep(step - 1)}
            className="p-2 text-white hover:opacity-80 active:translate-x-[-1px] transition"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2 text-xs text-white/80">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
            <span>Registro Conductor</span>
          </div>
        </header>

        <div className="mb-3">
          <h1 className="text-xl font-semibold drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
            {step === 1
              ? "Datos personales"
              : step === 2
                ? "Datos del vehículo"
                : "Documentación"}
          </h1>
          <p className="mt-1 text-sm text-white/85">
            Completa los campos para registrarte como conductor
          </p>
        </div>

        {/* Card */}
        <div className="mt-2 flex-1">
          <div className="bg-white/96 rounded-[24px] px-5 py-6 shadow-[0_20px_45px_rgba(0,0,0,0.55)] backdrop-blur-sm">
            {/* Progress bar */}
            <div className="flex gap-2 mb-5">
              <div
                className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-[#F6A33A]" : "bg-slate-200"
                  }`}
              />
              <div
                className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-[#F6A33A]" : "bg-slate-200"
                  }`}
              />
              <div
                className={`h-1 flex-1 rounded-full ${step >= 3 ? "bg-[#F6A33A]" : "bg-slate-200"
                  }`}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 && (
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
                        placeholder="Carlos Rodríguez"
                        value={formData.fullName}
                        onChange={(e) =>
                          updateField("fullName", e.target.value)
                        }
                        className="pl-11 h-11 rounded-2xl border border-slate-200 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A] text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-slate-800"
                    >
                      Teléfono
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+505 8888 8888"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
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
                      Correo electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="conductor@ejemplo.com"
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
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="busNumber"
                      className="text-sm font-medium text-slate-800"
                    >
                      Número de bus
                    </Label>
                    <div className="relative">
                      <Bus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="busNumber"
                        type="text"
                        placeholder="Bus 42"
                        value={formData.busNumber}
                        onChange={(e) =>
                          updateField("busNumber", e.target.value)
                        }
                        className="pl-11 h-11 rounded-2xl border border-slate-200 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A] text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="brand"
                      className="text-sm font-medium text-slate-800"
                    >
                      Marca del vehículo
                    </Label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="brand"
                        type="text"
                        placeholder="Mercedes-Benz"
                        value={formData.brand}
                        onChange={(e) => updateField("brand", e.target.value)}
                        className="pl-11 h-11 rounded-2xl border border-slate-200 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A] text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="capacity"
                      className="text-sm font-medium text-slate-800"
                    >
                      Capacidad de pasajeros
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="40"
                        value={formData.capacity}
                        onChange={(e) =>
                          updateField("capacity", e.target.value)
                        }
                        className="pl-11 h-11 rounded-2xl border border-slate-200 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A] text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="plate"
                      className="text-sm font-medium text-slate-800"
                    >
                      Placa del vehículo
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="plate"
                        type="text"
                        placeholder="ABC-1234"
                        value={formData.plate}
                        onChange={(e) => updateField("plate", e.target.value)}
                        className="pl-11 h-11 rounded-2xl border border-slate-200 focus-visible:ring-[#F6A33A]/60 focus-visible:border-[#F6A33A] text-sm"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="license"
                      className="text-sm font-medium text-slate-800"
                    >
                      Licencia de conducir vigente
                    </Label>
                    <div className="relative">
                      <label
                        htmlFor="license"
                        className="flex items-center justify-center h-28 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-[#F6A33A] transition-colors bg-slate-50"
                      >
                        <div className="text-center space-y-2">
                          <Upload className="w-7 h-7 mx-auto text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {formData.license
                              ? formData.license.name
                              : "Subir licencia"}
                          </p>
                        </div>
                        <input
                          id="license"
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleFileChange(
                              "license",
                              e.target.files?.[0] || null
                            )
                          }
                          required
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="idCard"
                      className="text-sm font-medium text-slate-800"
                    >
                      Cédula de identidad
                    </Label>
                    <div className="relative">
                      <label
                        htmlFor="idCard"
                        className="flex items-center justify-center h-28 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-[#F6A33A] transition-colors bg-slate-50"
                      >
                        <div className="text-center space-y-2">
                          <Upload className="w-7 h-7 mx-auto text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {formData.idCard
                              ? formData.idCard.name
                              : "Subir cédula"}
                          </p>
                        </div>
                        <input
                          id="idCard"
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleFileChange(
                              "idCard",
                              e.target.files?.[0] || null
                            )
                          }
                          required
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="circulation"
                      className="text-sm font-medium text-slate-800"
                    >
                      Circulación del vehículo
                    </Label>
                    <div className="relative">
                      <label
                        htmlFor="circulation"
                        className="flex items-center justify-center h-28 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-[#F6A33A] transition-colors bg-slate-50"
                      >
                        <div className="text-center space-y-2">
                          <Upload className="w-7 h-7 mx-auto text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {formData.circulation
                              ? formData.circulation.name
                              : "Subir circulación"}
                          </p>
                        </div>
                        <input
                          id="circulation"
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleFileChange(
                              "circulation",
                              e.target.files?.[0] || null
                            )
                          }
                          required
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full h-11 rounded-full text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(0,0,0,0.35)] transition-all duration-200 hover:brightness-110 hover:translate-y-[1px] active:translate-y-[2px]"
                style={{
                  background:
                    "linear-gradient(90deg, #FFC933 0%, #F6A33A 50%, #F27C3A 100%)",
                }}
              >
                {step < 3 ? (
                  <>
                    Siguiente
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
