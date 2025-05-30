-- CreateTable
CREATE TABLE "Mantenimiento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "costo" REAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "lista_de_piezas" TEXT NOT NULL,
    "cambio_de_pieza" BOOLEAN NOT NULL,
    "numero_serie_anterior" TEXT,
    "numero_serie_nueva" TEXT,
    "vehicleId" INTEGER NOT NULL,
    CONSTRAINT "Mantenimiento_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
