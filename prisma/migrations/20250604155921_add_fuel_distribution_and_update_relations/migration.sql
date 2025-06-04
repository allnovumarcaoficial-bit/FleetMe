/*
  Warnings:

  - You are about to drop the column `vehicleId` on the `FuelOperation` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "FuelDistribution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fuelOperationId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "liters" REAL NOT NULL,
    CONSTRAINT "FuelDistribution_fuelOperationId_fkey" FOREIGN KEY ("fuelOperationId") REFERENCES "FuelOperation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FuelDistribution_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FuelOperation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipoOperacion" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "saldoInicio" REAL NOT NULL,
    "valorOperacionDinero" REAL NOT NULL,
    "valorOperacionLitros" REAL NOT NULL,
    "saldoFinal" REAL NOT NULL,
    "saldoFinalLitros" REAL NOT NULL,
    "fuelCardId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FuelOperation_fuelCardId_fkey" FOREIGN KEY ("fuelCardId") REFERENCES "FuelCard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FuelOperation" ("createdAt", "fecha", "fuelCardId", "id", "saldoFinal", "saldoFinalLitros", "saldoInicio", "tipoOperacion", "updatedAt", "valorOperacionDinero", "valorOperacionLitros") SELECT "createdAt", "fecha", "fuelCardId", "id", "saldoFinal", "saldoFinalLitros", "saldoInicio", "tipoOperacion", "updatedAt", "valorOperacionDinero", "valorOperacionLitros" FROM "FuelOperation";
DROP TABLE "FuelOperation";
ALTER TABLE "new_FuelOperation" RENAME TO "FuelOperation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
