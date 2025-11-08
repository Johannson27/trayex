/*
  Warnings:

  - You are about to drop the column `qrCode` on the `Reservation` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('ACTIVE', 'SAFE', 'INCIDENT');

-- AlterEnum
ALTER TYPE "ReservationStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "qrCode",
ADD COLUMN     "etaMinutes" INTEGER,
ADD COLUMN     "routeId" TEXT;

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mainStops" JSONB,
    "status" "RouteStatus" NOT NULL DEFAULT 'ACTIVE',
    "capacity" INTEGER NOT NULL DEFAULT 40,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");

-- CreateIndex
CREATE INDEX "Reservation_timeslotId_idx" ON "Reservation"("timeslotId");

-- CreateIndex
CREATE INDEX "Reservation_stopId_idx" ON "Reservation"("stopId");

-- CreateIndex
CREATE INDEX "Reservation_tripId_idx" ON "Reservation"("tripId");

-- CreateIndex
CREATE INDEX "Reservation_routeId_idx" ON "Reservation"("routeId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;
