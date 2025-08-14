/*
  Warnings:

  - You are about to alter the column `odometro_Vehicle` on the `FuelDistribution` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.
  - The `estado` column on the `Mantenimiento` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `tipoComustible_id` on the `OperationTipo` table. All the data in the column will be lost.
  - You are about to alter the column `km_recorrido` on the `Vehicle` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.
  - You are about to drop the `TipoComustible` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FuelOperationToReservorio` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[fuelOperationId,tipoCombustible_id]` on the table `OperationTipo` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `tipoOperacion` on the `FuelOperation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tipo` on the `Mantenimiento` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `tipoCombustible_id` to the `OperationTipo` table without a default value. This is not possible if the table is not empty.
  - Made the column `fuelOperationId` on table `OperationTipo` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `capacidad_actual` on the `Reservorio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `capacidad_total` on the `Reservorio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tipoServicio` on the `Servicio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `estado` on the `Servicio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MantenimientoTipo" AS ENUM ('Correctivo', 'Preventivo');

-- CreateEnum
CREATE TYPE "MantenimientoEstado" AS ENUM ('Pendiente', 'Ejecutado', 'Cancelado');

-- CreateEnum
CREATE TYPE "ServicioTipo" AS ENUM ('EntregaDePedidos', 'Logistico', 'Administrativo');

-- CreateEnum
CREATE TYPE "ServicioEstado" AS ENUM ('Pendiente', 'Completado', 'Cancelado');

-- CreateEnum
CREATE TYPE "FuelOperationType" AS ENUM ('Carga', 'Consumo');

-- DropForeignKey
ALTER TABLE "FuelDistribution" DROP CONSTRAINT "FuelDistribution_fuelOperationId_fkey";

-- DropForeignKey
ALTER TABLE "FuelDistribution" DROP CONSTRAINT "FuelDistribution_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "OperationTipo" DROP CONSTRAINT "OperationTipo_fuelOperationId_fkey";

-- DropForeignKey
ALTER TABLE "OperationTipo" DROP CONSTRAINT "OperationTipo_tipoComustible_id_fkey";

-- DropForeignKey
ALTER TABLE "Reservorio" DROP CONSTRAINT "Reservorio_tipoCombustibleId_fkey";

-- DropForeignKey
ALTER TABLE "_FuelOperationToReservorio" DROP CONSTRAINT "_FuelOperationToReservorio_A_fkey";

-- DropForeignKey
ALTER TABLE "_FuelOperationToReservorio" DROP CONSTRAINT "_FuelOperationToReservorio_B_fkey";

-- AlterTable
ALTER TABLE "Driver" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "FuelDistribution" ALTER COLUMN "fuelOperationId" DROP NOT NULL,
ALTER COLUMN "vehicleId" DROP NOT NULL,
ALTER COLUMN "odometro_Vehicle" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "FuelOperation" DROP COLUMN "tipoOperacion",
ADD COLUMN     "tipoOperacion" "FuelOperationType" NOT NULL;

-- AlterTable
ALTER TABLE "Mantenimiento" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "MantenimientoTipo" NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "MantenimientoEstado" NOT NULL DEFAULT 'Pendiente';

-- AlterTable
ALTER TABLE "OperationTipo" DROP COLUMN "tipoComustible_id",
ADD COLUMN     "tipoCombustible_id" INTEGER NOT NULL,
ALTER COLUMN "fuelOperationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Reservorio" DROP COLUMN "capacidad_actual",
ADD COLUMN     "capacidad_actual" DOUBLE PRECISION NOT NULL,
DROP COLUMN "capacidad_total",
ADD COLUMN     "capacidad_total" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Servicio" DROP COLUMN "tipoServicio",
ADD COLUMN     "tipoServicio" "ServicioTipo" NOT NULL,
ALTER COLUMN "odometroInicial" SET DATA TYPE BIGINT,
ALTER COLUMN "odometroFinal" SET DATA TYPE BIGINT,
ALTER COLUMN "kilometrosRecorridos" DROP NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "ServicioEstado" NOT NULL;

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "km_recorrido" SET DEFAULT 0,
ALTER COLUMN "km_recorrido" SET DATA TYPE BIGINT;

-- DropTable
DROP TABLE "TipoComustible";

-- DropTable
DROP TABLE "_FuelOperationToReservorio";

-- CreateTable
CREATE TABLE "OperationReservorio" (
    "id" TEXT NOT NULL,
    "fuelOperationId" INTEGER NOT NULL,
    "reservorio_id" TEXT NOT NULL,
    "operationType" TEXT,

    CONSTRAINT "OperationReservorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoCombustible" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "fechaUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tipoCombustibleEnum" "TipoCombustibleEnum" NOT NULL,

    CONSTRAINT "TipoCombustible_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OperationReservorio_fuelOperationId_reservorio_id_key" ON "OperationReservorio"("fuelOperationId", "reservorio_id");

-- CreateIndex
CREATE UNIQUE INDEX "TipoCombustible_nombre_key" ON "TipoCombustible"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "OperationTipo_fuelOperationId_tipoCombustible_id_key" ON "OperationTipo"("fuelOperationId", "tipoCombustible_id");

-- AddForeignKey
ALTER TABLE "Reservorio" ADD CONSTRAINT "Reservorio_tipoCombustibleId_fkey" FOREIGN KEY ("tipoCombustibleId") REFERENCES "TipoCombustible"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationReservorio" ADD CONSTRAINT "OperationReservorio_fuelOperationId_fkey" FOREIGN KEY ("fuelOperationId") REFERENCES "FuelOperation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationReservorio" ADD CONSTRAINT "OperationReservorio_reservorio_id_fkey" FOREIGN KEY ("reservorio_id") REFERENCES "Reservorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelDistribution" ADD CONSTRAINT "FuelDistribution_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelDistribution" ADD CONSTRAINT "FuelDistribution_fuelOperationId_fkey" FOREIGN KEY ("fuelOperationId") REFERENCES "FuelOperation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationTipo" ADD CONSTRAINT "OperationTipo_fuelOperationId_fkey" FOREIGN KEY ("fuelOperationId") REFERENCES "FuelOperation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationTipo" ADD CONSTRAINT "OperationTipo_tipoCombustible_id_fkey" FOREIGN KEY ("tipoCombustible_id") REFERENCES "TipoCombustible"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
