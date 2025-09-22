-- CreateEnum
CREATE TYPE "TipoAjuste" AS ENUM ('CREDITO', 'DEBITO');

-- CreateTable
CREATE TABLE "Ajuste" (
    "id" TEXT NOT NULL,
    "tarjetaId" INTEGER NOT NULL,
    "tipoOperacion" "TipoAjuste" NOT NULL,
    "valorOperacion" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ajuste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ajuste_tarjetaId_idx" ON "Ajuste"("tarjetaId");

-- AddForeignKey
ALTER TABLE "Ajuste" ADD CONSTRAINT "Ajuste_tarjetaId_fkey" FOREIGN KEY ("tarjetaId") REFERENCES "FuelCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
