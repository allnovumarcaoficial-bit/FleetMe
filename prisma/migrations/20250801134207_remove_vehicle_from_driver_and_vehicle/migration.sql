/*
  Warnings:

  - You are about to drop the column `driverId` on the `Vehicle` table. All the data in the column will be lost.

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
    "destino" TEXT NOT NULL DEFAULT 'Administrativo'
);
INSERT INTO "new_Vehicle" ("amperage", "cantidad_baterias", "cantidad_conductores", "cantidad_neumaticos", "capacidad_carga", "capacidad_tanque", "ciclo_mantenimiento_km", "destino", "es_electrico", "estado", "fecha_compra", "fecha_vencimiento_circulacion", "fecha_vencimiento_licencia_operativa", "fecha_vencimiento_somaton", "gps", "id", "indice_consumo", "listado_municipios", "marca", "matricula", "modelo", "tipo_bateria", "tipo_combustible", "tipo_neumaticos", "tipo_vehiculo", "vin", "voltage") SELECT "amperage", "cantidad_baterias", "cantidad_conductores", "cantidad_neumaticos", "capacidad_carga", "capacidad_tanque", "ciclo_mantenimiento_km", "destino", "es_electrico", "estado", "fecha_compra", "fecha_vencimiento_circulacion", "fecha_vencimiento_licencia_operativa", "fecha_vencimiento_somaton", "gps", "id", "indice_consumo", "listado_municipios", "marca", "matricula", "modelo", "tipo_bateria", "tipo_combustible", "tipo_neumaticos", "tipo_vehiculo", "vin", "voltage" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");
CREATE UNIQUE INDEX "Vehicle_matricula_key" ON "Vehicle"("matricula");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
