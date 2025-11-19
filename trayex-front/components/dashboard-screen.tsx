"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { MapPin, ChevronDown, AlertTriangle } from "lucide-react"

import { RoutesScreen } from "@/components/routes-screen"
import { PassesScreen } from "@/components/pass-screen"
import { TripInProgressScreen } from "@/components/trip-in-progress-screen"
import { NotificationsScreen } from "@/components/notifications-screen"
import { ProfileScreen } from "@/components/profile-screen"
import type { UserRole } from "@/types"
import { getUser, saveUser, getToken } from "@/lib/session"
import { getMe } from "@/lib/api"
import { StudentBottomNav, type TabId } from "@/components/student-bottom-nav"
import { FaresScreen } from "@/components/fares-screen"
import { reverseGeocode } from "@/lib/reverse-geocode"
import { fetchNearbyStops } from "@/lib/fetch-stops"
import { useLocation } from "@/hooks/useLocation"

type DashboardScreenProps = {
  userRole: UserRole
}

type NavItem = "home" | "routes" | "fares" | "pass" | "notifications" | "profile"

function tabFromNav(nav: NavItem): TabId {
  switch (nav) {
    case "home":
      return "home"
    case "routes":
      return "bus"
    case "fares":
      return "money"
    case "pass":
      return "ticket"
    case "notifications":
      return "bell"
    case "profile":
      return "user"
  }
}

function navFromTab(tab: TabId): NavItem {
  switch (tab) {
    case "home":
      return "home"
    case "bus":
      return "routes"
    case "money":
      return "fares"
    case "ticket":
      return "pass"
    case "bell":
      return "notifications"
    case "user":
      return "profile"
  }
}

export function DashboardScreen({ userRole }: DashboardScreenProps) {
  const [activeNav, setActiveNav] = useState<NavItem>("home")
  const [unreadCount, setUnreadCount] = useState(0)
  const [tripInProgress, setTripInProgress] = useState<string | null>(null)

  // ======== SESIÓN / NOMBRE =========
  const [user, setUser] = useState<any>(getUser())

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
        // ignoramos error, usamos lo que haya en localStorage
      })
  }, [])
  const [search, setSearch] = useState("");

  const { position, loading } = useLocation();
  const [district, setDistrict] = useState("Cargando...");
  const [nearbyStops, setNearbyStops] = useState<any[]>([]);
  useEffect(() => {
    if (!position) return;

    reverseGeocode(position.lat, position.lon).then((name) => {
      setDistrict(name);

      // 🔵 GUARDAR UBICACIÓN ACTUAL PARA LAS RESERVAS
      localStorage.setItem("currentUserLocation", name);
    });

    const stops = fetchNearbyStops(position.lat, position.lon)
    setNearbyStops(stops);
  }, [position]);

  const displayName = useMemo(() => {
    const full = user?.student?.fullName || user?.student?.fullname
    if (full && typeof full === "string" && full.trim().length > 0) return full
    if (user?.email) return user.email
    return user?.role || userRole || "Usuario"
  }, [user, userRole])

  const firstName = useMemo(() => {
    const parts = String(displayName).trim().split(" ")
    return parts[0] || "viajar"
  }, [displayName])

  const handleReserveRoute = (routeName: string) => {
    setTripInProgress(routeName)
    // nos vamos al tab de rutas (opcional)
    setActiveNav("routes")
  }

  const handleEndTrip = () => {
    setTripInProgress(null)
    setActiveNav("home")
  }

  // ======== CONTENIDOS POR TAB =========
  const renderContent = () => {
    // 🧡 si hay viaje en progreso, mostramos SIEMPRE esa pantalla
    if (tripInProgress) {
      return (
        <TripInProgressScreen
          routeName={tripInProgress}
          onEndTrip={handleEndTrip}
        />
      )
    }

    if (activeNav === "routes") {
      return (
        <div className="relative z-10 min-h-[calc(100vh-80px)] bg-transparent">
          <RoutesScreen setActiveNav={setActiveNav} />
        </div>
      )
    }


    if (activeNav === "fares") {
      return (
        <div className="relative z-10 min-h-[calc(100vh-80px)] bg-background">
          <FaresScreen key={Date.now()} setActiveNav={setActiveNav} />
        </div>
      )
    }

    if (activeNav === "pass") {
      return (
        <div className="relative z-10 min-h-[calc(100vh-80px)] bg-transparent">
          <PassesScreen key={Date.now()} setActiveNav={setActiveNav} />

        </div>
      )
    }

    if (activeNav === "notifications") {
      return (
        <div className="relative z-10 min-h-[calc(100vh-80px)] bg-transparent">
          <NotificationsScreen onUpdateUnreadCount={setUnreadCount} />
        </div>
      )
    }

    if (activeNav === "profile") {
      return (
        <div className="relative z-10 min-h-[calc(100vh-80px)] bg-transparent">
          <ProfileScreen userRole={userRole} />
        </div>
      )
    }

    // ======== HOME (diseño Figma estático) =========
    return (
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex flex-col px-5 pt-8 pb-4">
        <div className="bg-white rounded-[32px] shadow-[0_20px_45px_rgba(0,0,0,0.28)] px-5 pt-5 pb-7 space-y-5">
          {/* Fila superior: ubicación + SOS */}
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-800">
                {district}
              </span>

              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            <button className="px-4 py-1.5 rounded-full bg-[#FFC933] text-xs font-semibold text-slate-900 shadow-sm flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              SOS
            </button>
          </div>

          {/* HERO */}
          <div className="rounded-[26px] overflow-hidden shadow-md">
            <div className="relative w-full h-44">
              <Image
                src="/assets/dashboard-hero.jpg"
                alt="¿Dónde tienes que ir?"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-end justify-center pb-5 px-4">
                <p className="text-white text-lg font-semibold text-center drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
                  {`¿Dónde tienes que ir, ${firstName}?`}
                </p>
              </div>
            </div>
          </div>

          {/* BUSCADOR */}
          {/* BUSCAR RUTA */}
          <div className="mt-1 px-1">
            <button
              onClick={() => setActiveNav("routes")}
              className="w-full h-12 rounded-full bg-[#f5f6fb] hover:bg-[#eceffd] transition text-sm font-medium text-slate-800 shadow flex items-center justify-center gap-2 border border-transparent"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#5A4EA3]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>

              Buscar una ruta
            </button>
          </div>

          {/* PARADAS CERCANAS */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Paradas cercanas
            </h2>

            <div className="flex gap-3 overflow-x-auto pb-1">
              {nearbyStops.length === 0 && (
                <p className="text-xs text-slate-500">Buscando paradas cercanas...</p>
              )}

              {nearbyStops.slice(0, 3).map((stop, i) => (
                <div
                  key={i}
                  className="min-w-[120px] max-w-[130px] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                >
                  <div className="relative w-full h-20">
                    <Image
                      src={`https://maps.googleapis.com/maps/api/staticmap?center=${stop.lat},${stop.lon}&zoom=16&size=200x200&markers=color:blue|${stop.lat},${stop.lon}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                      alt={`Parada ${i + 1}`}
                      fill
                      className="object-cover"
                    />




                  </div>

                  <div className="px-3 py-2 space-y-1">
                    <p className="text-xs font-semibold text-slate-900">
                      Parada {i + 1}
                    </p>

                    <button
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/?q=${stop.lat},${stop.lon}`,
                          "_blank"
                        )
                      }}
                      className="w-full h-7 rounded-full bg-slate-900 text-[11px] font-medium text-white"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    )
  }

  // ======== LAYOUT GENERAL + NAVBAR FIJA =========
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="relative w-full max-w-md min-h-screen bg-slate-900 overflow-hidden">
        {/* Fondo general */}
        <Image
          src="/assets/bg-dashboard.jpg"
          alt="Fondo Trayex"
          fill
          priority
          className="object-cover"
        />

        {/* Contenido (dejamos espacio para la navbar) */}
        <div className="relative z-10 pb-20">
          {renderContent()}
        </div>

        {/* Navbar siempre visible */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
          <StudentBottomNav
            active={tabFromNav(activeNav)}
            onChange={(tab) => {
              const newNav = navFromTab(tab)
              setTripInProgress(null)
              setActiveNav(newNav)
            }}
          />
        </div>
      </div>
    </div>
  )
}
