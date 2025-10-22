"use client";

import { Button } from "@/components/ui/button";
import { markIntroSeen } from "@/lib/intro";

export function IntroScreen({
    userId,
    onDone,
}: { userId: string; onDone: () => void }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-lg border">
                    {/* Reemplaza por tu <video> real */}
                    <video
                        className="w-full h-64 bg-black"
                        autoPlay
                        muted
                        controls
                        src="/trayex-intro.mp4"
                    />
                </div>
                <Button
                    className="w-full rounded-2xl"
                    onClick={() => { markIntroSeen(userId); onDone(); }}
                >
                    Omitir
                </Button>
            </div>
        </div>
    );
}
