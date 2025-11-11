// scripts/osm-build.mjs  (ESM)
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parseo simple de args: --clave valor
function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i++) {
        const key = argv[i];
        if (!key.startsWith("--")) continue;
        const val = argv[i + 1];
        args[key] = val;
        i++;
    }
    return args;
}

const args = parseArgs(process.argv);
const stopsIn = args["--stops"];
const routesIn = args["--routes"];
const stopsOut = args["--out-stops"];
const routesOut = args["--out-routes"];

if (!stopsIn || !routesIn || !stopsOut || !routesOut) {
    console.error(
        "Uso: node scripts/osm-build.mjs --stops <geojson> --routes <overpass.json> --out-stops <out.json> --out-routes <out.json>"
    );
    process.exit(1);
}

// util
async function ensureDirFor(filePath) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
}

// ------------- LECTURA -------------
const stopsRaw = JSON.parse(await fs.readFile(stopsIn, "utf8"));
const routesRaw = JSON.parse(await fs.readFile(routesIn, "utf8"));

// ------------- TRANSFORM: PARADAS -------------
// Espera GeoJSON con FeatureCollection de Point
const stops = (stopsRaw.features ?? [])
    .filter(f => f?.geometry?.type === "Point")
    .map((f, i) => {
        const [lng, lat] = f.geometry.coordinates ?? [];
        const p = f.properties ?? {};
        const name =
            p.name ??
            p.ref ??
            p.stop_name ??
            p["name:es"] ??
            `Parada ${i + 1}`;
        const id = String(p.id ?? p["@id"] ?? p.osm_id ?? `stop_${i + 1}`);
        return { id, name, lat, lng, isSafe: true };
    });

// ------------- TRANSFORM: RUTAS -------------
// Overpass “raw” suele venir como { elements:[ ... ] }
const elements = routesRaw.elements ?? [];
// Toma relations/ways con route=bus o public_transport=route
const routeElems = elements.filter(e => {
    const t = e.tags ?? {};
    return t.route === "bus" || t.public_transport === "route";
});

function pickName(tags = {}) {
    return (
        tags.name ??
        (tags.ref ? `Ruta ${tags.ref}` : null) ??
        tags["name:es"] ??
        "Ruta sin nombre"
    );
}

const routes = routeElems.map((e, idx) => {
    const tags = e.tags ?? {};
    const name = pickName(tags);
    // intenta extraer paradas (depende del dataset)
    const mainStops = [];
    if (Array.isArray(e.members)) {
        for (const m of e.members) {
            if ((m.role === "stop" || m.role === "platform") && m?.tags?.name) {
                mainStops.push(m.tags.name);
            } else if (m?.type === "node" && m?.tags?.name) {
                mainStops.push(m.tags.name);
            }
            if (mainStops.length >= 5) break;
        }
    }
    return {
        id: String(e.id ?? `route_${idx + 1}`),
        name,
        description: tags.operator ?? null,
        mainStops: mainStops.length ? mainStops : [],
        status: "ACTIVE",
        estimatedTime: tags.duration ?? "—",
        capacity: tags.capacity ?? "—",
        isFavorite: false,
    };
});

// ------------- ESCRITURA -------------
await ensureDirFor(stopsOut);
await ensureDirFor(routesOut);

await fs.writeFile(stopsOut, JSON.stringify({ stops }, null, 2), "utf8");
await fs.writeFile(routesOut, JSON.stringify({ routes }, null, 2), "utf8");

console.log(
    `OK • Generados:\n  - ${path.resolve(stopsOut)}\n  - ${path.resolve(routesOut)}`
);
