/*
  Warnings:

  - You are about to drop the `OperationTipo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tipoCombustible_id` to the `FuelOperation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OperationTipo" DROP CONSTRAINT "OperationTipo_fuelOperationId_fkey";

-- DropForeignKey
ALTER TABLE "OperationTipo" DROP CONSTRAINT "OperationTipo_tipoCombustible_id_fkey";

-- AlterTable
ALTER TABLE "FuelOperation" ADD COLUMN     "tipoCombustible_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "OperationTipo";

-- AddForeignKey
ALTER TABLE "FuelOperation" ADD CONSTRAINT "FuelOperation_tipoCombustible_id_fkey" FOREIGN KEY ("tipoCombustible_id") REFERENCES "TipoCombustible"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
