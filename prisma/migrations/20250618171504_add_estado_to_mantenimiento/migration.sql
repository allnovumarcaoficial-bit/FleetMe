-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mantenimiento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "costo" REAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "lista_de_piezas" TEXT NOT NULL,
    "cambio_de_pieza" BOOLEAN NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "numero_serie_anterior" TEXT,
    "numero_serie_nueva" TEXT,
    "vehicleId" INTEGER NOT NULL,
    CONSTRAINT "Mantenimiento_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Mantenimiento" ("cambio_de_pieza", "costo", "descripcion", "fecha", "id", "lista_de_piezas", "numero_serie_anterior", "numero_serie_nueva", "tipo", "vehicleId") SELECT "cambio_de_pieza", "costo", "descripcion", "fecha", "id", "lista_de_piezas", "numero_serie_anterior", "numero_serie_nueva", "tipo", "vehicleId" FROM "Mantenimiento";
DROP TABLE "Mantenimiento";
ALTER TABLE "new_Mantenimiento" RENAME TO "Mantenimiento";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
