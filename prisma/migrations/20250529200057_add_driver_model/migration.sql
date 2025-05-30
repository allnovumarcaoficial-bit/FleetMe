/*
  Warnings:

  - You are about to drop the `VehicleDriver` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `carnet_peritage` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_vencimiento_licencia` to the `Driver` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VehicleDriver";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Driver" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "licencia" TEXT NOT NULL,
    "fecha_vencimiento_licencia" DATETIME NOT NULL,
    "carnet_peritage" BOOLEAN NOT NULL
);
INSERT INTO "new_Driver" ("id", "licencia", "nombre") SELECT "id", "licencia", "nombre" FROM "Driver";
DROP TABLE "Driver";
ALTER TABLE "new_Driver" RENAME TO "Driver";
CREATE UNIQUE INDEX "Driver_licencia_key" ON "Driver"("licencia");
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
    "tipoNombre" TEXT,
    "driverId" INTEGER,
    CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("estado", "fecha_compra", "fecha_vencimiento_circulacion", "fecha_vencimiento_licencia_operativa", "fecha_vencimiento_somaton", "gps", "id", "listado_municipios", "marca", "matricula", "modelo", "tipoNombre", "vin") SELECT "estado", "fecha_compra", "fecha_vencimiento_circulacion", "fecha_vencimiento_licencia_operativa", "fecha_vencimiento_somaton", "gps", "id", "listado_municipios", "marca", "matricula", "modelo", "tipoNombre", "vin" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");
CREATE UNIQUE INDEX "Vehicle_matricula_key" ON "Vehicle"("matricula");
CREATE UNIQUE INDEX "Vehicle_driverId_key" ON "Vehicle"("driverId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
