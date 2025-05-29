-- CreateTable
CREATE TABLE "Vehicle" (
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
    "idtipo" INTEGER NOT NULL,
    CONSTRAINT "Vehicle_idtipo_fkey" FOREIGN KEY ("idtipo") REFERENCES "VehicleType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehicleType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "licencia" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VehicleDriver" (
    "vehicleId" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,

    PRIMARY KEY ("vehicleId", "driverId"),
    CONSTRAINT "VehicleDriver_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VehicleDriver_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_matricula_key" ON "Vehicle"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleType_nombre_key" ON "VehicleType"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_licencia_key" ON "Driver"("licencia");
