-- CreateEnum
CREATE TYPE "Moneda" AS ENUM ('USD', 'CUP', 'MLC');

-- CreateEnum
CREATE TYPE "MantenimientoTipo" AS ENUM ('Correctivo', 'Preventivo');

-- CreateEnum
CREATE TYPE "MantenimientoEstado" AS ENUM ('Pendiente', 'Ejecutado', 'Cancelado');

-- CreateEnum
CREATE TYPE "ServicioTipo" AS ENUM ('EntregaDePedidos', 'Logistico', 'Administrativo');

-- CreateEnum
CREATE TYPE "ServicioEstado" AS ENUM ('Pendiente', 'Completado', 'Cancelado');

-- CreateEnum
CREATE TYPE "FuelOperationType" AS ENUM ('Carga', 'Consumo');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('info', 'success', 'warning', 'error', 'critical');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "DestinoVehiculo" AS ENUM ('Administrativo', 'Logistico', 'Reparto');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "hashedPassword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "link" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "fecha_compra" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento_licencia_operativa" TIMESTAMP(3) NOT NULL,
    "km_recorrido" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "photo_Car" TEXT,
    "fecha_vencimiento_circulacion" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento_somaton" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL,
    "gps" BOOLEAN NOT NULL,
    "listado_municipios" TEXT,
    "tipo_vehiculo" TEXT,
    "cantidad_neumaticos" INTEGER,
    "tipo_neumaticos" TEXT,
    "capacidad_carga" TEXT,
    "cantidad_conductores" INTEGER,
    "ciclo_mantenimiento_km" INTEGER,
    "odometro" INTEGER,
    "es_electrico" BOOLEAN,
    "cantidad_baterias" INTEGER,
    "tipo_bateria" TEXT,
    "amperage" DOUBLE PRECISION,
    "voltage" DOUBLE PRECISION,
    "tipo_combustible" TEXT,
    "capacidad_tanque" DOUBLE PRECISION,
    "indice_consumo" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "destino" "DestinoVehiculo" NOT NULL DEFAULT 'Administrativo',

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "licencia" TEXT NOT NULL,
    "fecha_vencimiento_licencia" TIMESTAMP(3) NOT NULL,
    "carnet_peritage" BOOLEAN NOT NULL,
    "phone" TEXT,
    "carnet" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "photo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "vehicleId" INTEGER,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mantenimiento" (
    "id" SERIAL NOT NULL,
    "tipo" "MantenimientoTipo" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "costo" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT NOT NULL,
    "lista_de_piezas" TEXT NOT NULL,
    "cambio_de_pieza" BOOLEAN NOT NULL,
    "estado" "MantenimientoEstado" NOT NULL DEFAULT 'Pendiente',
    "numero_serie_anterior" TEXT,
    "numero_serie_nueva" TEXT,
    "vehicleId" INTEGER,

    CONSTRAINT "Mantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelCard" (
    "id" SERIAL NOT NULL,
    "numeroDeTarjeta" TEXT NOT NULL,
    "tipoDeTarjeta" TEXT NOT NULL,
    "moneda" "Moneda" NOT NULL,
    "saldo" DOUBLE PRECISION,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservorio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "capacidad_actual" DOUBLE PRECISION NOT NULL,
    "capacidad_total" DOUBLE PRECISION NOT NULL,
    "tipoCombustibleId" INTEGER,

    CONSTRAINT "Reservorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationReservorio" (
    "id" TEXT NOT NULL,
    "fuelOperationId" INTEGER NOT NULL,
    "reservorio_id" TEXT NOT NULL,
    "litros" DOUBLE PRECISION NOT NULL,
    "operationType" TEXT,

    CONSTRAINT "OperationReservorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" SERIAL NOT NULL,
    "tipoServicio" "ServicioTipo" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "odometroInicial" INTEGER NOT NULL,
    "odometroFinal" INTEGER,
    "cantidadPedidos" INTEGER,
    "origen" TEXT,
    "destino" TEXT,
    "descripcion" TEXT,
    "kilometrosRecorridos" INTEGER,
    "driver_id" INTEGER,
    "estado" "ServicioEstado" NOT NULL,
    "vehicleId" INTEGER,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelOperation" (
    "id" SERIAL NOT NULL,
    "tipoOperacion" "FuelOperationType" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "saldoInicio" DOUBLE PRECISION NOT NULL,
    "valorOperacionDinero" DOUBLE PRECISION,
    "valorOperacionLitros" DOUBLE PRECISION,
    "saldoFinal" DOUBLE PRECISION,
    "saldoFinalLitros" DOUBLE PRECISION,
    "fuelCardId" INTEGER NOT NULL,
    "descripcion" TEXT,
    "ubicacion_cupet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tipoCombustible_id" INTEGER,

    CONSTRAINT "FuelOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelDistribution" (
    "id" SERIAL NOT NULL,
    "fuelOperationId" INTEGER,
    "vehicleId" INTEGER,
    "liters" DOUBLE PRECISION NOT NULL,
    "odometro_Vehicle" INTEGER,

    CONSTRAINT "FuelDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoCombustible" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "fechaUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moneda" "Moneda" NOT NULL,

    CONSTRAINT "TipoCombustible_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_matricula_key" ON "Vehicle"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_licencia_key" ON "Driver"("licencia");

-- CreateIndex
CREATE UNIQUE INDEX "FuelCard_numeroDeTarjeta_key" ON "FuelCard"("numeroDeTarjeta");

-- CreateIndex
CREATE UNIQUE INDEX "OperationReservorio_fuelOperationId_reservorio_id_key" ON "OperationReservorio"("fuelOperationId", "reservorio_id");

-- CreateIndex
CREATE UNIQUE INDEX "TipoCombustible_nombre_key" ON "TipoCombustible"("nombre");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mantenimiento" ADD CONSTRAINT "Mantenimiento_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservorio" ADD CONSTRAINT "Reservorio_tipoCombustibleId_fkey" FOREIGN KEY ("tipoCombustibleId") REFERENCES "TipoCombustible"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationReservorio" ADD CONSTRAINT "OperationReservorio_fuelOperationId_fkey" FOREIGN KEY ("fuelOperationId") REFERENCES "FuelOperation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationReservorio" ADD CONSTRAINT "OperationReservorio_reservorio_id_fkey" FOREIGN KEY ("reservorio_id") REFERENCES "Reservorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelOperation" ADD CONSTRAINT "FuelOperation_fuelCardId_fkey" FOREIGN KEY ("fuelCardId") REFERENCES "FuelCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelOperation" ADD CONSTRAINT "FuelOperation_tipoCombustible_id_fkey" FOREIGN KEY ("tipoCombustible_id") REFERENCES "TipoCombustible"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelDistribution" ADD CONSTRAINT "FuelDistribution_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelDistribution" ADD CONSTRAINT "FuelDistribution_fuelOperationId_fkey" FOREIGN KEY ("fuelOperationId") REFERENCES "FuelOperation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
