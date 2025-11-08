"use client";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Button>;

export function GradientButton({ className, ...props }: Props) {
    return (
        <Button
            {...props}
            className={cn(
                "h-12 rounded-2xl text-white font-semibold shadow-md",
                "bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 hover:opacity-95",
                className
            )}
        />
    );
}
