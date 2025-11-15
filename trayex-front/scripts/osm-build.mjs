// scripts/osm-build.mjs (ESM) — genera:
// - public/data/managua-stops.json
// - public/data/managua-routes.json (con shape + stops por ruta)

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

// ========= 1) LECTURA =========
const stopsRaw = JSON.parse(await fs.readFile(stopsIn, "utf8"));
const routesRaw = JSON.parse(await fs.readFile(routesIn, "utf8"));

// ========= 2) PARADAS GLOBALES (GeoJSON) =========
// Espera FeatureCollection con Point
const stops = (stopsRaw.features ?? [])
    .filter((f) => f?.geometry?.type === "Point")
    .map((f, i) => {
        const [lng, lat] = f.geometry.coordinates;
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

// ========= 3) INDICES OSM (nodes/ways/relations) =========
const elements = routesRaw.elements ?? [];

const nodes = elements.filter((e) => e.type === "node");
const ways = elements.filter((e) => e.type === "way");
const relations = elements.filter((e) => e.type === "relation");

const nodeMap = new Map(nodes.map((n) => [n.id, n]));
const wayMap = new Map(ways.map((w) => [w.id, w]));

// ========= 4) FILTRAR RUTAS DE BUS =========
const routeElems = relations.filter((e) => {
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

// Construye el shape (lista de puntos) a partir de los ways de la relación
function buildShapeForRelation(rel) {
    const coords = [];
    for (const m of rel.members ?? []) {
        if (m.type !== "way") continue;
        const way = wayMap.get(m.ref);
        if (!way || !Array.isArray(way.nodes)) continue;

        for (const nodeId of way.nodes) {
            const n = nodeMap.get(nodeId);
            if (!n) continue;
            const lat = Number(n.lat);
            const lng = Number(n.lon);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

            if (coords.length) {
                const last = coords[coords.length - 1];
                if (
                    Math.abs(last.lat - lat) < 1e-6 &&
                    Math.abs(last.lng - lng) < 1e-6
                ) {
                    continue; // evitar duplicados seguidos
                }
            }
            coords.push({ lat, lng });
        }
    }
    return coords;
}

// Extrae paradas para la ruta a partir de miembros tipo node con tags de parada
function extractStopsForRelation(rel) {
    const routeStops = [];
    for (const m of rel.members ?? []) {
        if (m.type !== "node") continue;
        const node = nodeMap.get(m.ref);
        const tags = (node && node.tags) || m.tags || {};
        const isStop =
            tags.highway === "bus_stop" ||
            tags.public_transport === "platform" ||
            tags.public_transport === "stop_position";

        if (!isStop) continue;

        const lat = Number(node?.lat);
        const lng = Number(node?.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

        const name =
            tags.name ?? tags["name:es"] ?? tags.ref ?? "Parada sin nombre";

        routeStops.push({
            id: String(node?.id ?? m.ref),
            name,
            lat,
            lng,
            isSafe: true,
        });
    }
    return routeStops;
}

// ========= 5) ARMAR RUTAS =========
const routes = routeElems.map((e, idx) => {
    const tags = e.tags ?? {};
    const name = pickName(tags);

    const shape = buildShapeForRelation(e);
    const stopsForRoute = extractStopsForRelation(e);
    const mainStops = stopsForRoute.slice(0, 5).map((s) => s.name);

    return {
        id: String(e.id ?? `route_${idx + 1}`),
        name,
        description: tags.operator ?? null,
        mainStops,
        status: "ACTIVE",
        estimatedTime: tags.duration ?? "—",
        capacity: tags.capacity ?? "—",
        isFavorite: false,
        // campos que tu front ya espera
        stops: stopsForRoute,
        shape,
    };
});

// ========= 6) ESCRITURA =========
await ensureDirFor(stopsOut);
await ensureDirFor(routesOut);

await fs.writeFile(stopsOut, JSON.stringify({ stops }, null, 2), "utf8");
await fs.writeFile(routesOut, JSON.stringify({ routes }, null, 2), "utf8");

console.log(
    `OK • Generados:\n  - ${path.resolve(stopsOut)}\n  - ${path.resolve(
        routesOut
    )}`
);
