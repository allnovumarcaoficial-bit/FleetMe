/*
  Warnings:

  - You are about to drop the `VehicleType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `tipoNombre` on the `Vehicle` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "VehicleType_nombre_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VehicleType";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vehicle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "fecha_compra" DATETIME NOT NULL,
    "fecha_vencimiento_licencia_operativa" DATETIME NOT NULL,
    "fecha_vencimiento_circulacion" DATETIME NOT NULL,
    "fecha_vencimiento_somaton" DATETIME NOT NULL,
    "estado" TEXT NOT NULL,
    "gps" BOOLEAN NOT NULL,
    "listado_municipios" TEXT NOT NULL,
    "tipo_vehiculo" TEXT,
    "cantidad_neumaticos" INTEGER,
    "tipo_neumaticos" TEXT,
    "capacidad_carga" TEXT,
    "cantidad_conductores" INTEGER,
    "ciclo_mantenimiento_km" INTEGER,
    "es_electrico" BOOLEAN,
    "cantidad_baterias" INTEGER,
    "tipo_bateria" TEXT,
    "amperage" REAL,
    "voltage" REAL,
    "tipo_combustible" TEXT,
    "capacidad_tanque" REAL,
    "indice_consumo" REAL,
    "driverId" INTEGER,
    CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("driverId", "estado", "fecha_compra", "fecha_vencimiento_circulacion", "fecha_vencimiento_licencia_operativa", "fecha_vencimiento_somaton", "gps", "id", "listado_municipios", "marca", "matricula", "modelo", "vin") SELECT "driverId", "estado", "fecha_compra", "fecha_vencimiento_circulacion", "fecha_vencimiento_licencia_operativa", "fecha_vencimiento_somaton", "gps", "id", "listado_municipios", "marca", "matricula", "modelo", "vin" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");
CREATE UNIQUE INDEX "Vehicle_matricula_key" ON "Vehicle"("matricula");
CREATE UNIQUE INDEX "Vehicle_driverId_key" ON "Vehicle"("driverId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
