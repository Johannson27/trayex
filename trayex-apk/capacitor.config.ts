import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.trayex.app',
    appName: 'TRAYEX',
    webDir: 'www',
    server: {
        url: 'https://trayex.vercel.app',  // <-- tu landing en Vercel
        cleartext: false
    },
    android: {
        allowMixedContent: false
    }
};

export default config;
