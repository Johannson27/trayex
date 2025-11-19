/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development', // Deshabilita en dev
});

const nextConfig = {
    reactStrictMode: true,

    experimental: {
        swcPlugins: [],
    },

    devIndicators: {
        buildActivity: false,
    },

    pwa: {
        disable: process.env.NODE_ENV === 'development',
    },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "maps.googleapis.com",
            },
        ],
    },
};

module.exports = withPWA(nextConfig);
