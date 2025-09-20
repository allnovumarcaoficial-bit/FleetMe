import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fuelOperation = await prisma.fuelOperation.findUnique({
      where: { id: parseInt(id) },
      include: {
        fuelCard: true,
        fuelDistributions: {
          include: {
            vehicle: true,
          },
        },
        operationReservorio: {
          include: {
            reservorio: true,
          },
        },
        tipoCombustible: true, // Include tipoCombustible
      },
    });

    if (!fuelOperation) {
      return NextResponse.json(
        { message: 'Fuel operation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(fuelOperation);
  } catch (error) {
    console.error('Error fetching fuel operation:', error);
    return NextResponse.json(
      { message: 'Error fetching fuel operation', error },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      tipoOperacion,
      fecha,
      valorOperacionDinero,
      valorOperacionLitros,
      saldoInicio,
      saldoFinal,
      saldoFinalLitros,
      fuelCardId,
      reservorioId, // Source reservoir
      descripcion,
      ubicacion_cupet,
      fuelDistributions, // Vehicle destinations
      operationReservorio, // Reservoir destinations
    } = body;

    if (!tipoOperacion || !fecha) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (
      tipoOperacion === 'Consumo' &&
      saldoInicio !== undefined &&
      valorOperacionDinero > saldoInicio
    ) {
      return NextResponse.json(
        {
          message:
            'El valor de la operación no puede ser mayor al saldo de la tarjeta',
        },
        { status: 400 }
      );
    }

    if (
      tipoOperacion === 'Consumo' &&
      fuelDistributions &&
      fuelDistributions.length > 0
    ) {
      for (const dist of fuelDistributions) {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: dist.vehicleId },
        });
        if (
          vehicle &&
          vehicle.capacidad_tanque !== null &&
          dist.liters > vehicle.capacidad_tanque
        ) {
          return NextResponse.json(
            {
              message: `Los litros para el vehículo ${vehicle.matricula} exceden la capacidad de su tanque`,
            },
            { status: 400 }
          );
        }
      }
    }

    const reservoirOpsToCreate = [];
    // Handle reservoir destinations
    if (operationReservorio && operationReservorio.length > 0) {
      for (const op of operationReservorio) {
        if (op.reservorio_id && op.litros) {
          reservoirOpsToCreate.push({
            reservorio: { connect: { id: op.reservorio_id } },
            litros: op.litros,
            operationType: 'destination',
          });
        }
      }
    }
    // Handle source reservoir
    if (reservorioId) {
      reservoirOpsToCreate.push({
        reservorio: { connect: { id: reservorioId } },
        litros: valorOperacionLitros,
        operationType: 'source',
      });
    }

    const updatedFuelOperation = await prisma.fuelOperation.update({
      where: { id: parseInt(id) },
      data: {
        tipoOperacion,
        fecha: new Date(fecha),
        valorOperacionDinero,
        valorOperacionLitros,
        saldoInicio,
        saldoFinal,
        saldoFinalLitros,
        descripcion,
        ubicacion_cupet,
        fuelCardId: fuelCardId || null,
        fuelDistributions: {
          deleteMany: {},
          create:
            fuelDistributions?.map((dist: any) => ({
              liters: dist.liters,
              vehicleId: dist.vehicleId,
            })) || [],
        },
        operationReservorio: {
          deleteMany: {},
          create: reservoirOpsToCreate,
        },
      },
    });

    return NextResponse.json(updatedFuelOperation);
  } catch (error) {
    console.error('Error updating fuel operation:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'Error updating fuel operation', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const operationId = parseInt(id);

    const fuelOperation = await prisma.fuelOperation.findUnique({
      where: { id: operationId },
      include: {
        fuelCard: true,
        operationReservorio: {
          include: {
            reservorio: true,
          },
        },
      },
    });

    if (!fuelOperation) {
      return NextResponse.json(
        { message: 'Operación de combustible no encontrada' },
        { status: 404 }
      );
    }

    if (fuelOperation.tipoOperacion === 'Carga') {
      const subsequentConsumptions = await prisma.fuelOperation.count({
        where: {
          fuelCardId: fuelOperation.fuelCardId,
          fecha: {
            gt: fuelOperation.fecha,
          },
          tipoOperacion: 'Consumo',
        },
      });

      if (subsequentConsumptions > 0) {
        return NextResponse.json(
          {
            message:
              'No se puede eliminar una carga si hay consumos posteriores.',
          },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction(async (prisma) => {
      // Primero, eliminar los registros dependientes
      await prisma.fuelDistribution.deleteMany({
        where: { fuelOperationId: operationId },
      });

      await prisma.operationReservorio.deleteMany({
        where: { fuelOperationId: operationId },
      });

      // Luego, eliminar la operación de combustible principal
      await prisma.fuelOperation.delete({
        where: { id: operationId },
      });

      if (
        fuelOperation.fuelCard &&
        fuelOperation.valorOperacionDinero !== null
      ) {
        const amount = fuelOperation.valorOperacionDinero;
        let newBalance;

        if (fuelOperation.tipoOperacion === 'Carga') {
          newBalance = (fuelOperation.fuelCard.saldo ?? 0) - amount;
        } else if (fuelOperation.tipoOperacion === 'Consumo') {
          newBalance = (fuelOperation.fuelCard.saldo ?? 0) + amount;
        }

        if (newBalance !== undefined) {
          await prisma.fuelCard.update({
            where: { id: fuelOperation.fuelCardId! },
            data: { saldo: newBalance },
          });
        }
      }

      // Restaurar la capacidad del reservorio
      if (fuelOperation.operationReservorio) {
        for (const op of fuelOperation.operationReservorio) {
          if (op.reservorio && op.litros) {
            const currentCapacity = op.reservorio.capacidad_actual ?? 0;
            let newCapacity;

            if (op.operationType === 'Carga') {
              // Si fue una carga al reservorio (destino), se RESTA al eliminar la operación
              newCapacity = currentCapacity - op.litros;
            } else if (op.operationType === 'Consumo') {
              // Si fue un consumo del reservorio (origen), se SUMA al eliminar la operación
              newCapacity = currentCapacity + op.litros;
            }

            if (newCapacity !== undefined) {
              await prisma.reservorio.update({
                where: { id: op.reservorio_id },
                data: { capacidad_actual: newCapacity },
              });
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Operación de combustible eliminada correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar la operación de combustible:', error);
    return NextResponse.json(
      { message: 'Error al eliminar la operación de combustible', error },
      { status: 500 }
    );
  }
}
