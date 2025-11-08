/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Zone` will be added. If there are existing duplicate values, this will fail.
  - Made the column `serviceHours` on table `Zone` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Zone" ALTER COLUMN "serviceHours" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Zone_name_key" ON "Zone"("name");
