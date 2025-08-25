-- DropForeignKey
ALTER TABLE "FuelOperation" DROP CONSTRAINT "FuelOperation_tipoCombustible_id_fkey";

-- AlterTable
ALTER TABLE "FuelOperation" ALTER COLUMN "tipoCombustible_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FuelOperation" ADD CONSTRAINT "FuelOperation_tipoCombustible_id_fkey" FOREIGN KEY ("tipoCombustible_id") REFERENCES "TipoCombustible"("id") ON DELETE SET NULL ON UPDATE CASCADE;
