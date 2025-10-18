# Trayex Backend (MVP Scaffold)

Ejecuta una API Express + Prisma para reservas por franja, QR offline firmado, SOS y ETA básico.

## Requisitos
- Node 20+
- Docker (opcional pero recomendado) / Postgres 15
- npm

## Arranque rápido
```bash
cp .env.example .env
docker compose up -d db
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

API en `http://localhost:4000` y docs (`openapi.yaml`) con:
```bash
npm run openapi:serve
```

## Estructura
- `src/` Express + routes
- `prisma/schema.prisma` PostgreSQL
- `openapi.yaml` contratos básicos
- `src/ws.ts` Socket.IO (rooms por `tripId` y `sosId`)
- `src/services/jwt.ts` rotación de llaves para QR
- `src/middleware/` auth, rbac, idempotency

_Generado 2025-10-15T02:29:24.366921Z_
