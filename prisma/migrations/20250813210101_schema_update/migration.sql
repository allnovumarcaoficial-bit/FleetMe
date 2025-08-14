/*
  Warnings:

  - You are about to drop the column `reservorioId` on the `FuelOperation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "FuelOperation" DROP CONSTRAINT "FuelOperation_reservorioId_fkey";

-- AlterTable
ALTER TABLE "FuelDistribution" ADD COLUMN     "odometro_Vehicle" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "FuelOperation" DROP COLUMN "reservorioId";

-- CreateTable
CREATE TABLE "_FuelOperationToReservorio" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FuelOperationToReservorio_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FuelOperationToReservorio_B_index" ON "_FuelOperationToReservorio"("B");

-- AddForeignKey
ALTER TABLE "_FuelOperationToReservorio" ADD CONSTRAINT "_FuelOperationToReservorio_A_fkey" FOREIGN KEY ("A") REFERENCES "FuelOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FuelOperationToReservorio" ADD CONSTRAINT "_FuelOperationToReservorio_B_fkey" FOREIGN KEY ("B") REFERENCES "Reservorio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
