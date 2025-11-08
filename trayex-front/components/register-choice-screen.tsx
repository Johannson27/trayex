"use client";
type Props = { onPick: (role: "student" | "driver") => void; onBack: () => void };

export function RegisterChoiceScreen({ onPick, onBack }: Props) {
    return (
        <div className="min-h-[100dvh] relative">
            <div
                className="absolute inset-0 -z-10"
                style={{
                    background:
                        "linear-gradient(180deg,#2b77d7 0%, #3f8ae0 30%, #eaeef6 75%)",
                }}
            />
            <div className="absolute left-4 top-6">
                <button onClick={onBack} className="text-white/90 text-xl">←</button>
            </div>

            <div className="pt-16 text-center text-white">
                <h2 className="text-2xl font-extrabold tracking-wide">CREAR UNA CUENTA</h2>
            </div>

            <div className="px-6 mt-12 flex flex-col gap-5">
                <button
                    onClick={() => onPick("student")}
                    className="h-14 rounded-2xl text-slate-900 font-semibold shadow-md bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500"
                >
                    Estudiante
                </button>

                <button
                    onClick={() => onPick("driver")}
                    className="h-14 rounded-2xl text-slate-900 font-semibold shadow-md bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500"
                >
                    Conductor
                </button>
            </div>
        </div>
    );
}
