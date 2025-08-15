/*
  Warnings:

  - You are about to alter the column `odometro_Vehicle` on the `FuelDistribution` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `odometroInicial` on the `Servicio` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `odometroFinal` on the `Servicio` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "FuelDistribution" ALTER COLUMN "odometro_Vehicle" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Servicio" ALTER COLUMN "odometroInicial" SET DATA TYPE INTEGER,
ALTER COLUMN "odometroFinal" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "km_recorrido" SET DEFAULT 0,
ALTER COLUMN "km_recorrido" SET DATA TYPE DOUBLE PRECISION;
