/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        swcPlugins: [],
    },
    // Deshabilitar PWA en desarrollo
    devIndicators: {
        buildActivity: false,
    },
    // Esto asegura que Next no registre service workers en dev
    pwa: {
        disable: process.env.NODE_ENV === 'development',
    },
}

export default nextConfig
