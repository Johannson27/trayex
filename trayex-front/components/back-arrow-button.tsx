"use client"

import { ArrowLeft } from "lucide-react"

interface BackArrowButtonProps {
    onClick: () => void
}

export function BackArrowButton({ onClick }: BackArrowButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
        inline-flex items-center justify-center
        w-10 h-10
        rounded-full
        shadow-[0_6px_14px_rgba(0,0,0,0.25)]
        bg-gradient-to-br from-[#FFC933] via-[#F6A33A] to-[#F27C3A]
        hover:brightness-110 active:translate-y-[1px]
        transition-all
      "
        >
            <ArrowLeft className="w-5 h-5 text-white" />
        </button>
    )
}
