import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const metadata: Metadata = {
  title: "TRAYEX",
  description: "Trayectoria y Exactitud",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/icon-192.png" }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#204284"
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return (
    <html lang="es">
      <head>
        {mapsKey && (
          <script async
            src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`}>
          </script>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}

