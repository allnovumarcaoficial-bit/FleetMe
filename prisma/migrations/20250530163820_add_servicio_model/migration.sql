-- CreateTable
CREATE TABLE "Servicio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipoServicio" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "odometroInicial" INTEGER NOT NULL,
    "odometroFinal" INTEGER,
    "cantidadPedidos" INTEGER,
    "origen" TEXT,
    "destino" TEXT,
    "descripcion" TEXT,
    "kilometrosRecorridos" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    CONSTRAINT "Servicio_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
