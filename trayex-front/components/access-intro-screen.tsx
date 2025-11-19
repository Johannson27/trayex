// components/access-intro-screen.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const slides = [
    { id: 0, src: "/assets/acceso2-bg.jpg" },
    { id: 1, src: "/assets/acceso3-bg.jpg" },
];

interface AccessIntroScreenProps {
    onContinue: () => void;
}

export function AccessIntroScreen({ onContinue }: AccessIntroScreenProps) {
    const [index, setIndex] = useState(0);

    // rotación automática
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black">
            {/* slides de fondo */}
            {slides.map((slide, i) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <Image
                        src={slide.src}
                        alt={`Acceso ${i + 1}`}
                        fill
                        priority={i === 0}
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[#204284]/60" />
                </div>
            ))}

            {/* contenido */}
            <div className="relative z-10 min-h-screen flex flex-col justify-between px-6 pt-16 pb-10 max-w-md mx-auto text-white">
                <header className="mt-4 space-y-3">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                        Bienvenidos
                    </p>
                    <h1 className="text-3xl font-semibold leading-snug">
                        Nuestra prioridad es tu comodidad y confianza.
                    </h1>
                    <p className="text-sm text-white/80">
                        Conecta con conductores certificados y buses modernos, listos para
                        llevarte a donde más lo necesites.
                    </p>
                </header>

                <div className="space-y-6">
                    {/* dots */}
                    <div className="flex justify-center gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`h-2 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-2 bg-white/40"
                                    }`}
                                aria-label={`Ir a la imagen ${i + 1}`}
                            />
                        ))}
                    </div>

                    <Button
                        className="w-full h-12 rounded-full bg-white text-slate-900 font-semibold text-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.55)] hover:bg-white/90 hover:translate-y-[1px] active:translate-y-[2px] transition-all"
                        onClick={onContinue}
                    >
                        Comenzar
                    </Button>
                </div>
            </div>
        </div>
    );
}
