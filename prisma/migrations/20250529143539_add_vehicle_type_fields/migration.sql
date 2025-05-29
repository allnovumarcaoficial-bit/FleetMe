/*
  Warnings:

  - Added the required column `cantidad_conductores` to the `VehicleType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cantidad_neumaticos` to the `VehicleType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacidad_carga` to the `VehicleType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ciclo_mantenimiento_km` to the `VehicleType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `es_electrico` to the `VehicleType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_neumaticos` to the `VehicleType` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VehicleType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "cantidad_neumaticos" INTEGER NOT NULL,
    "tipo_neumaticos" TEXT NOT NULL,
    "capacidad_carga" TEXT NOT NULL,
    "cantidad_conductores" INTEGER NOT NULL,
    "ciclo_mantenimiento_km" INTEGER NOT NULL,
    "es_electrico" BOOLEAN NOT NULL,
    "cantidad_baterias" INTEGER,
    "tipo_bateria" TEXT,
    "amperage" REAL,
    "voltage" REAL,
    "tipo_combustible" TEXT,
    "capacidad_tanque" REAL,
    "indice_consumo" REAL
);
INSERT INTO "new_VehicleType" ("id", "nombre") SELECT "id", "nombre" FROM "VehicleType";
DROP TABLE "VehicleType";
ALTER TABLE "new_VehicleType" RENAME TO "VehicleType";
CREATE UNIQUE INDEX "VehicleType_nombre_key" ON "VehicleType"("nombre");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
