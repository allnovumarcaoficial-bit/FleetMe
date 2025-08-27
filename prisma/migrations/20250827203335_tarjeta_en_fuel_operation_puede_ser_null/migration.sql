-- DropForeignKey
ALTER TABLE "FuelOperation" DROP CONSTRAINT "FuelOperation_fuelCardId_fkey";

-- AlterTable
ALTER TABLE "FuelOperation" ALTER COLUMN "fuelCardId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FuelOperation" ADD CONSTRAINT "FuelOperation_fuelCardId_fkey" FOREIGN KEY ("fuelCardId") REFERENCES "FuelCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
