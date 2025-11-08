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


const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development', // activa en prod
})
module.exports = withPWA({
    reactStrictMode: true,
})
export default nextConfig
