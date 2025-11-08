"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
    const [activeStep, setActiveStep] = useState(0);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="min-h-screen">
            {/* HEADER — negro para que el logo blanco luzca */}
            <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-black/20">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 relative">
                            <Image src="/trayex-logo.png" alt="TRAYEX" fill className="object-contain" />
                        </div>
                        <div>
                            <div className="font-bold text-sm text-white leading-none">TRAYEX</div>
                            <div className="text-xs text-gray-300">Trayectoria y Exactitud</div>
                        </div>
                    </div>

                    {/* Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {[
                            ["Características", "features"],
                            ["Cómo funciona", "how-it-works"],
                            ["Clientes", "testimonials"],
                            ["Contacto", "cta"],
                        ].map(([label, id]) => (
                            <button
                                key={id}
                                onClick={() => scrollToSection(id)}
                                className="text-sm text-gray-300 hover:text-[#FFD600] transition"
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* CTA */}
                    <a
                        href="/app/trayex.apk"
                        download
                        className="px-6 py-2 bg-gradient-to-r from-[#204284] to-[#3077B2] text-white rounded-lg text-sm font-medium hover:shadow-lg transition"
                    >
                        Descargar App
                    </a>

                </nav>
            </header>

            {/* ===== HERO (SECCIÓN 1) — Degradado azul profundo ===== */}
            <section
                className="relative overflow-hidden"
                style={{
                    background:
                        "linear-gradient(180deg, #204284 0%, #3077B2 55%, #00AEEF 120%)",
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Izquierda */}
                        <div className="space-y-6 text-white">
                            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                                Optimiza tus trayectos con precisión
                            </h1>
                            <p className="text-lg/7 text-white/90">
                                Rastreo en tiempo real, códigos QR seguros y reportes automáticos para transporte y logística.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <Link
                                    href="/"
                                    className="px-8 py-3 bg-[#FFD600] text-gray-900 rounded-lg font-semibold hover:shadow-xl transition text-center"
                                >
                                    Probar demo
                                </Link>
                                <a
                                    href="/app/trayex.apk"
                                    download
                                    className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition text-center"
                                >
                                    Descargar App
                                </a>

                            </div>
                        </div>

                        {/* Derecha — mock teléfono */}
                        <div className="relative h-96 md:h-full flex items-center justify-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00AEEF] rounded-full blur-3xl opacity-25" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl opacity-10" />

                            <div className="relative w-64 h-96 bg-gradient-to-b from-white/20 to-white/10 rounded-3xl shadow-2xl overflow-hidden border-8 border-white/20 backdrop-blur">
                                <div className="w-full h-full flex flex-col items-center justify-center p-6">
                                    <div className="w-full bg-white/20 rounded-2xl p-4 space-y-3">
                                        <div className="h-12 bg-white/35 rounded-lg" />
                                        <div className="h-8 bg-white/25 rounded-lg w-3/4" />
                                        <div className="h-32 bg-white/35 rounded-lg" />
                                    </div>
                                </div>

                                {/* Onda inferior en amarillo → azul oscuro */}
                                <svg
                                    className="absolute bottom-0 left-0 right-0 w-full h-16"
                                    viewBox="0 0 300 100"
                                    preserveAspectRatio="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <defs>
                                        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#FFD600" />
                                            <stop offset="100%" stopColor="#204284" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,30 Q75,10 150,30 T300,30 L300,100 L0,100 Z" fill="url(#waveGrad)" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Separador inferior */}
                <svg className="block w-full" viewBox="0 0 1440 60" preserveAspectRatio="none">
                    <path d="M0,0 C240,60 480,60 720,30 C960,0 1200,0 1440,30 L1440,60 L0,60 Z" fill="#EAF6FF" />
                </svg>
            </section>

            {/* ===== FEATURES (SECCIÓN 2) — Azul MUY claro ===== */}
            <section id="features" className="py-20" style={{ backgroundColor: "#EAF6FF" }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[#204284] mb-3">Características principales</h2>
                        <p className="text-lg text-[#204284]/70">Todo lo que necesitas para optimizar tu operación</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Rastreo en tiempo real", desc: "Ubica flotas y paradas con exactitud.", icon: "📍" },
                            { title: "Códigos QR seguros", desc: "Control de acceso y validación offline.", icon: "📱" },
                            { title: "Geocercas y alertas", desc: "Notificaciones por desvíos o retrasos.", icon: "⚠️" },
                            { title: "Reportes y analíticas", desc: "KPIs y eficiencia operativa.", icon: "📊" },
                        ].map((f, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl border border-white/60 bg-white/80 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition"
                            >
                                <div className="text-4xl mb-4">{f.icon}</div>
                                <h3 className="text-lg font-semibold text-[#204284] mb-2">{f.title}</h3>
                                <p className="text-[#204284]/70 text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Separador entre SECCIONES 2–3 */}
            <svg className="block w-full" viewBox="0 0 1440 60" preserveAspectRatio="none">
                <path d="M0,30 C240,0 480,0 720,30 C960,60 1200,60 1440,30 L1440,60 L0,60 Z" fill="#F3F9FF" />
            </svg>

            {/* ===== HOW IT WORKS (SECCIÓN 3) — Degradado azul medio ===== */}
            <section
                id="how-it-works"
                className="py-20"
                style={{ background: "linear-gradient(180deg, #3077B2 0%, #00AEEF 100%)" }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 text-white">
                        <h2 className="text-4xl font-bold mb-3">Cómo funciona</h2>
                        <p className="text-lg text-white/85">Tres pasos simples para comenzar</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: 1, title: "Regístrate y configura zonas", desc: "Crea tu cuenta y define geocercas." },
                            { step: 2, title: "Genera QR y asigna rutas", desc: "QR únicos para cada parada o vehículo." },
                            { step: 3, title: "Monitorea y analiza", desc: "Reportes en tiempo real para optimizar." },
                        ].map((it, idx) => (
                            <div key={idx} className="relative text-center group" onMouseEnter={() => setActiveStep(idx)}>
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 mx-auto bg-white/15 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {it.step}
                                    </div>
                                    {idx < 2 && <div className="hidden md:block absolute top-8 left-full w-full h-1 bg-white/20" />}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{it.title}</h3>
                                <p className="text-white/85">{it.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Separador */}
            <svg className="block w-full" viewBox="0 0 1440 60" preserveAspectRatio="none">
                <path d="M0,0 C240,60 480,60 720,30 C960,0 1200,0 1440,30 L1440,60 L0,60 Z" fill="#F7FAFF" />
            </svg>

            {/* ===== DEMO (SECCIÓN 4) — Fondo claro azulado ===== */}
            <section className="py-20" style={{ backgroundColor: "#F7FAFF" }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Imagen */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl h-96">
                            <Image
                                src="/dashboard.png"
                                alt="Dashboard de monitoreo centralizado"
                                fill
                                className="object-cover"
                                priority
                            />
                            {/* overlays para armonizar con la paleta */}
                            <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(32,66,132,.40), rgba(0,174,239,.25))", mixBlendMode: "multiply" }} />
                            <div className="absolute inset-0 bg-black/10" />
                        </div>

                        {/* Texto */}
                        <div className="space-y-6">
                            <h2 className="text-4xl font-bold text-[#204284]">Monitoreo centralizado</h2>
                            <p className="text-lg text-[#204284]/80">
                                Visualiza todas tus rutas, paradas y vehículos en un solo panel. Accede a métricas clave en tiempo real
                                y toma decisiones informadas.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Mapa interactivo con ubicación de todos los vehículos",
                                    "Alertas instantáneas de desviaciones o retrasos",
                                    "Histórico completo de movimientos",
                                    "Exportar reportes en múltiples formatos",
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-[#204284]">
                                        <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIOS (SECCIÓN 5) — Azul oscuro sólido ===== */}
            <section id="testimonials" className="py-20" style={{ backgroundColor: "#204284" }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 text-white">
                        <h2 className="text-4xl font-bold mb-3">Lo que dicen nuestros clientes</h2>
                        <p className="text-lg text-white/80">Empresas confían en TRAYEX</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Carlos Rodríguez",
                                role: "CEO, Transportes Rápidos",
                                text:
                                    "TRAYEX nos ha permitido reducir retrasos en un 40% y mejorar la satisfacción del cliente significativamente.",
                                stars: 5,
                            },
                            {
                                name: "María González",
                                role: "Operations Manager, LogísticaPro",
                                text:
                                    "La precisión del rastreo y los reportes automáticos nos han ahorrado horas de trabajo administrativo.",
                                stars: 5,
                            },
                            {
                                name: "Juan Martínez",
                                role: "Director, Entregas Seguras",
                                text:
                                    "Los códigos QR y geocercas nos dan la confianza de saber exactamente dónde está cada envío.",
                                stars: 5,
                            },
                        ].map((t, i) => (
                            <div key={i} className="p-6 bg-white/05 backdrop-blur rounded-2xl border border-white/10 shadow-lg">
                                <div className="flex gap-1 mb-4" aria-label={`Calificación ${t.stars} estrellas`}>
                                    {[...Array(t.stars)].map((_, j) => (
                                        <svg key={j} className="w-5 h-5 text-[#FFD600] fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-white/90 mb-4">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-white/30 to-white/10 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-white text-sm">{t.name}</p>
                                        <p className="text-white/70 text-xs">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA (SECCIÓN 6) — Degradado azul → azul ===== */}
            <section id="cta" className="py-20 text-white" style={{ background: "linear-gradient(90deg, #204284 0%, #3077B2 60%, #00AEEF 100%)" }}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-5xl font-bold mb-4">Empieza hoy con TRAYEX</h2>
                    <p className="text-xl text-white/85 mb-8">Aumenta la precisión y simplifica la operación de tu transporte.</p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="px-8 py-4 bg-[#FFD600] text-gray-900 rounded-lg font-semibold hover:shadow-2xl transition"
                        >
                            Probar demo
                        </Link>
                        <a
                            href="mailto:ventas@trayex.com?subject=Quiero%20TRAYEX"
                            className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
                        >
                            Hablar con ventas
                        </a>
                    </div>
                </div>
            </section>

            {/* FOOTER — gris muy oscuro */}
            <footer className="bg-[#0F1220] text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00AEEF] to-[#204284]" />
                                <div>
                                    <div className="font-bold text-white text-sm leading-none">TRAYEX</div>
                                    <div className="text-xs text-gray-400">Trayectoria y Exactitud</div>
                                </div>
                            </div>
                            <p className="text-sm">Solución integral para transporte y logística.</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Producto</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="hover:text-white transition">Características</a></li>
                                <li><a href="#how-it-works" className="hover:text-white transition">Precios</a></li>
                                <li><a href="#testimonials" className="hover:text-white transition">Clientes</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
                                <li><a href="#" className="hover:text-white transition">Términos</a></li>
                                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Soporte</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">Centro de ayuda</a></li>
                                <li><a href="#" className="hover:text-white transition">Contacto</a></li>
                                <li><a href="#" className="hover:text-white transition">Estado</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 text-center text-sm">
                        <p>© 2025 TRAYEX. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
