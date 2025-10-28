import { prisma } from "../prisma";

async function main() {
    // Rutas base (coinciden con tu UI)
    await prisma.route.createMany({
        data: [
            {
                name: "Ruta 1 - Norte",
                description: "Campus Central → Zona Industrial",
                mainStops: ["Campus Central", "Av. Principal", "Centro Comercial", "Zona Industrial"] as any,
                status: "ACTIVE",
                capacity: 40,
            },
            {
                name: "Ruta 2 - Sur",
                description: "Campus Central → Residencias",
                mainStops: ["Campus Central", "Hospital", "Plaza Mayor", "Residencias"] as any,
                status: "SAFE",
                capacity: 40,
            },
            {
                name: "Ruta 3 - Este",
                description: "Campus Central → Parque Tecnológico",
                mainStops: ["Campus Central", "Biblioteca", "Estadio", "Parque Tecnológico"] as any,
                status: "INCIDENT",
                capacity: 40,
            },
        ],
        skipDuplicates: true,
    });

    // Zona + paradas + timeslots para quick-reserve
    const zone = await prisma.zone.upsert({
        where: { name: "Zona Centro" },
        update: {},
        create: {
            name: "Zona Centro",
            polygon: { type: "Polygon", coordinates: [] } as any,
            serviceHours: "06:00-23:00",
        },
    });

    // Paradas
    const existingStops = await prisma.stop.findMany({ where: { zoneId: zone.id } });
    if (existingStops.length === 0) {
        await prisma.stop.createMany({
            data: [
                { zoneId: zone.id, name: "Campus Central", lat: 12.119, lng: -86.240, isSafe: true },
                { zoneId: zone.id, name: "Av. Principal", lat: 12.121, lng: -86.238, isSafe: true },
                { zoneId: zone.id, name: "Centro Comercial", lat: 12.117, lng: -86.242, isSafe: true },
            ],
        });
    }

    // Timeslots futuros (3 slots de 30 min desde ahora)
    const now = new Date();
    const addMin = (d: Date, m: number) => new Date(d.getTime() + m * 60000);
    const existingTs = await prisma.timeslot.findMany({ where: { zoneId: zone.id, startAt: { gt: now } } });
    if (existingTs.length === 0) {
        const t1Start = addMin(now, 10);
        const t1End = addMin(now, 40);
        const t2Start = addMin(now, 50);
        const t2End = addMin(now, 80);
        const t3Start = addMin(now, 90);
        const t3End = addMin(now, 120);

        await prisma.timeslot.createMany({
            data: [
                { zoneId: zone.id, startAt: t1Start, endAt: t1End, capacity: 40 },
                { zoneId: zone.id, startAt: t2Start, endAt: t2End, capacity: 40 },
                { zoneId: zone.id, startAt: t3Start, endAt: t3End, capacity: 40 },
            ],
        });
    }

    console.log("Seed OK");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
