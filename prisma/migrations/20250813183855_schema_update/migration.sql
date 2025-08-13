/*
  Warnings:

  - You are about to drop the column `esReservorio` on the `FuelCard` table. All the data in the column will be lost.
  - You are about to drop the column `precioCombustible` on the `FuelCard` table. All the data in the column will be lost.
  - You are about to drop the column `tipoDeCombustible` on the `FuelCard` table. All the data in the column will be lost.
  - You are about to drop the column `driverId` on the `Vehicle` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoCombustibleEnum" AS ENUM ('Gasolina_Regular', 'Diesel', 'Gasolina_Especial');

-- DropForeignKey
ALTER TABLE "Mantenimiento" DROP CONSTRAINT "Mantenimiento_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "Servicio" DROP CONSTRAINT "Servicio_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_driverId_fkey";

-- DropIndex
DROP INDEX "Vehicle_driverId_key";

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "address" TEXT,
ADD COLUMN     "carnet" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "vehicleId" INTEGER;

-- AlterTable
ALTER TABLE "FuelCard" DROP COLUMN "esReservorio",
DROP COLUMN "precioCombustible",
DROP COLUMN "tipoDeCombustible",
ADD COLUMN     "saldo" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "FuelOperation" ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "reservorioId" TEXT,
ADD COLUMN     "ubicacion_cupet" TEXT;

-- AlterTable
ALTER TABLE "Mantenimiento" ALTER COLUMN "vehicleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "driver_id" INTEGER,
ALTER COLUMN "vehicleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "driverId",
ADD COLUMN     "km_recorrido" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "odometro" BIGINT,
ADD COLUMN     "photo_Car" TEXT;

-- CreateTable
CREATE TABLE "Reservorio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "capacidad_actual" TEXT NOT NULL,
    "capacidad_total" TEXT NOT NULL,
    "tipoCombustibleId" INTEGER,

    CONSTRAINT "Reservorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationTipo" (
    "id" TEXT NOT NULL,
    "fuelOperationId" INTEGER,
    "tipoComustible_id" INTEGER,

    CONSTRAINT "OperationTipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoComustible" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "fechaUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tipoCombustibleEnum" "TipoCombustibleEnum" NOT NULL,

    CONSTRAINT "TipoComustible_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TipoComustible_nombre_key" ON "TipoComustible"("nombre");

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mantenimiento" ADD CONSTRAINT "Mantenimiento_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservorio" ADD CONSTRAINT "Reservorio_tipoCombustibleId_fkey" FOREIGN KEY ("tipoCombustibleId") REFERENCES "TipoComustible"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelOperation" ADD CONSTRAINT "FuelOperation_reservorioId_fkey" FOREIGN KEY ("reservorioId") REFERENCES "Reservorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationTipo" ADD CONSTRAINT "OperationTipo_fuelOperationId_fkey" FOREIGN KEY ("fuelOperationId") REFERENCES "FuelOperation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationTipo" ADD CONSTRAINT "OperationTipo_tipoComustible_id_fkey" FOREIGN KEY ("tipoComustible_id") REFERENCES "TipoComustible"("id") ON DELETE SET NULL ON UPDATE CASCADE;
