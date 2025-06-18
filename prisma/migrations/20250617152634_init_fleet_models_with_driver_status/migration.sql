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
    "tipoNombre" TEXT,
    "driverId" INTEGER,
    CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehicleType" (
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

-- CreateTable
CREATE TABLE "Driver" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "licencia" TEXT NOT NULL,
    "fecha_vencimiento_licencia" DATETIME NOT NULL,
    "carnet_peritage" BOOLEAN NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Activo'
);

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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FuelOperation_fuelCardId_fkey" FOREIGN KEY ("fuelCardId") REFERENCES "FuelCard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FuelDistribution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fuelOperationId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "liters" REAL NOT NULL,
    CONSTRAINT "FuelDistribution_fuelOperationId_fkey" FOREIGN KEY ("fuelOperationId") REFERENCES "FuelOperation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FuelDistribution_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_matricula_key" ON "Vehicle"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_driverId_key" ON "Vehicle"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleType_nombre_key" ON "VehicleType"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_licencia_key" ON "Driver"("licencia");

-- CreateIndex
CREATE UNIQUE INDEX "FuelCard_numeroDeTarjeta_key" ON "FuelCard"("numeroDeTarjeta");
