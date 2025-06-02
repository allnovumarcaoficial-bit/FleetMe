-- CreateTable
CREATE TABLE "FuelCard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numeroDeTarjeta" TEXT NOT NULL,
    "tipoDeTarjeta" TEXT NOT NULL,
    "tipoDeCombustible" TEXT NOT NULL,
    "precioCombustible" REAL NOT NULL,
    "moneda" TEXT NOT NULL,
    "fechaVencimiento" DATETIME NOT NULL,
    "esReservorio" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FuelCard_numeroDeTarjeta_key" ON "FuelCard"("numeroDeTarjeta");
