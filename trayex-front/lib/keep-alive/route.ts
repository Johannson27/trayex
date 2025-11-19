export async function GET() {
    // URL de tu API en Render
    const RENDER_URL = "https://trayex-api.onrender.com/auth/me";

    try {
        // Le pegamos a una ruta cualquiera que requiera token (da igual si falla)
        const res = await fetch(RENDER_URL, { cache: "no-store" });

        return new Response(
            JSON.stringify({
                ok: true,
                status: res.status,
                info: "Ping enviado a Render",
            }),
            { status: 200 }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({
                ok: false,
                info: "No se pudo hacer ping al backend",
            }),
            { status: 500 }
        );
    }
}