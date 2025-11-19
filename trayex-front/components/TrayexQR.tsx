"use client";

import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";

export default function TrayexQR({
    value,
    size = 190,
}: {
    value: string;
    size?: number;
}) {
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <QRCodeSVG
                value={value}
                size={size}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#000000"
            />

            {/* LOGO EN EL CENTRO */}
            <div className="absolute inset-0 flex items-center justify-center">
                <Image
                    src="/qr-logo.png"
                    alt="Logo"
                    width={size * 0.28}
                    height={size * 0.28}
                    className="rounded-lg bg-white p-1"
                />
            </div>
        </div>
    );
}
