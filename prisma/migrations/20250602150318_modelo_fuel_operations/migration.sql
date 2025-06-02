-- CreateTable
CREATE TABLE "FuelOperation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipoOperacion" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "saldoInicio" REAL NOT NULL,
    "valorOperacionDinero" REAL NOT NULL,
    "valorOperacionLitros" REAL NOT NULL,
    "saldoFinal" REAL NOT NULL,
    "saldoFinalLitros" REAL NOT NULL,
    "fuelCardId" INTEGER NOT NULL,
    "vehicleId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FuelOperation_fuelCardId_fkey" FOREIGN KEY ("fuelCardId") REFERENCES "FuelCard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FuelOperation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
