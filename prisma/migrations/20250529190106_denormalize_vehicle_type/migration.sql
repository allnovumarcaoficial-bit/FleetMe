/*
  Warnings:

  - You are about to drop the column `tipoVehiculoId` on the `Vehicle` table. All the data in the column will be lost.

*/
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
    "tipoNombre" TEXT
);
INSERT INTO "new_Vehicle" ("estado", "fecha_compra", "fecha_vencimiento_circulacion", "fecha_vencimiento_licencia_operativa", "fecha_vencimiento_somaton", "gps", "id", "listado_municipios", "marca", "matricula", "modelo", "vin") SELECT "estado", "fecha_compra", "fecha_vencimiento_circulacion", "fecha_vencimiento_licencia_operativa", "fecha_vencimiento_somaton", "gps", "id", "listado_municipios", "marca", "matricula", "modelo", "vin" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");
CREATE UNIQUE INDEX "Vehicle_matricula_key" ON "Vehicle"("matricula");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
