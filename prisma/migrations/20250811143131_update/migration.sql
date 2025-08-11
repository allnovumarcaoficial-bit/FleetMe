-- DropForeignKey
ALTER TABLE "Servicio" DROP CONSTRAINT "Servicio_vehicleId_fkey";

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
