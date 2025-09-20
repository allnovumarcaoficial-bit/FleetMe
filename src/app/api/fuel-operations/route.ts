import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma types

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const orderBy = searchParams.get('orderBy') || 'fecha';
    const orderDirection = searchParams.get('orderDirection') || 'desc';
    const search = searchParams.get('search') || '';
    const fuelCardId = searchParams.get('fuelCardId'); // Get fuelCardId from search params

    // Column filters from frontend
    const tipoCombustible = searchParams.get('tipoCombustible') || '';
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const fuelCardNumeroDeTarjeta =
      searchParams.get('fuelCard.numeroDeTarjeta') || '';
    const saldoInicio = searchParams.get('saldoInicio') || '';
    const valorOperacionDinero = searchParams.get('valorOperacionDinero') || '';
    const valorOperacionLitros = searchParams.get('valorOperacionLitros') || '';
    const saldoFinal = searchParams.get('saldoFinal') || '';
    const saldoFinalLitros = searchParams.get('saldoFinalLitros') || '';
    const vehicleMatricula = searchParams.get('vehicle.matricula') || '';

    const skip = (page - 1) * limit;

    const where: Prisma.FuelOperationWhereInput = {
      ...(search
        ? {
            OR: [
              { fuelCard: { numeroDeTarjeta: { contains: search } } },
              {
                fuelDistributions: {
                  some: { vehicle: { matricula: { contains: search } } },
                },
              },
            ],
          }
        : {}),
      ...(fuelCardId ? { fuelCardId: parseInt(fuelCardId) } : {}),
    };

    // Apply column filters
    // if (tipoCombustible) {
    //   where.tipoCombustible = { contains: tipoCombustible };
    // }
    if (fechaDesde && fechaHasta) {
      where.fecha = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }
    if (fuelCardNumeroDeTarjeta) {
      where.fuelCard = {
        numeroDeTarjeta: { contains: fuelCardNumeroDeTarjeta },
      };
    }
    if (saldoInicio) {
      where.saldoInicio = parseFloat(saldoInicio);
    }
    if (valorOperacionDinero) {
      where.valorOperacionDinero = parseFloat(valorOperacionDinero);
    }
    if (valorOperacionLitros) {
      where.valorOperacionLitros = parseFloat(valorOperacionLitros);
    }
    if (saldoFinal) {
      where.saldoFinal = parseFloat(saldoFinal);
    }
    if (saldoFinalLitros) {
      where.saldoFinalLitros = parseFloat(saldoFinalLitros);
    }
    if (vehicleMatricula) {
      where.fuelDistributions = {
        some: {
          vehicle: {
            matricula: { contains: vehicleMatricula },
          },
        },
      };
    }

    const fuelOperations = await prisma.fuelOperation.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [orderBy]: orderDirection as Prisma.SortOrder, // Explicitly cast orderDirection
      },
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
      },
    });

    const total = await prisma.fuelOperation.count({ where });

    const formattedOperations = fuelOperations.map((op) => ({
      ...op,
      vehicle: op.fuelDistributions[0]?.vehicle || null,
      reservorio: op.operationReservorio[0]?.reservorio || null,
    }));

    return NextResponse.json({
      data: formattedOperations,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching fuel operations:', error);
    return NextResponse.json(
      { message: 'Error fetching fuel operations', error },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tipoOperacion,
      fecha,
      valorOperacionDinero,
      fuelCardId,
      fuelDistributions,
      operationReservorio, // Añadir operationReservorio
      tipoCombustible_id,
      valorOperacionLitros, // Recibir del frontend
      saldoFinalLitros, // Recibir del frontend
      reservorioId, // Recibir del frontend para operaciones con reservorio
      descripcion, // Recibir del frontend
      ubicacion_cupet, // Recibir del frontend
    } = body;

    let fuelCard;
    let saldoInicio;
    let saldoFinal;

    if (fuelCardId) {
      fuelCard = await prisma.fuelCard.findUnique({
        where: { id: fuelCardId },
      });

      if (!fuelCard) {
        return NextResponse.json(
          { message: 'Fuel card not found' },
          { status: 404 }
        );
      }

      saldoInicio = fuelCard.saldo;

      if (tipoOperacion === 'Carga') {
        saldoFinal = (saldoInicio || 0) + valorOperacionDinero;
      } else if (tipoOperacion === 'Consumo') {
        if (valorOperacionDinero > (saldoInicio || 0)) {
          return NextResponse.json(
            {
              message:
                'El valor de la operación no puede ser mayor al saldo de la tarjeta',
            },
            { status: 400 }
          );
        }
        saldoFinal = (saldoInicio || 0) - valorOperacionDinero;
      } else {
        return NextResponse.json(
          { message: 'Invalid tipoOperacion' },
          { status: 400 }
        );
      }
    } else {
      // Si no hay fuelCardId, la operación es con reservorio, y los saldos de tarjeta no aplican.
      saldoInicio = undefined;
      saldoFinal = undefined;
    }

    if (tipoOperacion === 'Consumo') {
      const totalLitrosVehicles = fuelDistributions
        ? fuelDistributions.reduce(
            (sum: number, dist: any) => sum + dist.liters,
            0
          )
        : 0;
      const totalLitrosReservorios = operationReservorio
        ? operationReservorio.reduce(
            (sum: number, opRes: any) => sum + opRes.litros,
            0
          )
        : 0;
      const totalLitrosDestinos = totalLitrosVehicles + totalLitrosReservorios;

      if (Math.abs(totalLitrosDestinos - (valorOperacionLitros || 0)) > 0.01) {
        return NextResponse.json(
          {
            message: `La suma de litros (${totalLitrosDestinos.toFixed(2)}) de los destinos debe ser igual al valor de la operación en litros (${(valorOperacionLitros || 0).toFixed(2)}).`,
          },
          { status: 400 }
        );
      }

      if (fuelDistributions) {
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

      if (operationReservorio) {
        for (const op of operationReservorio) {
          const reservorio = await prisma.reservorio.findUnique({
            where: { id: op.reservorio_id },
          });
          if (reservorio) {
            const capacidadDisponible =
              (reservorio.capacidad_total || 0) -
              (reservorio.capacidad_actual || 0);
            if (op.litros > capacidadDisponible) {
              return NextResponse.json(
                {
                  message: `La cantidad de litros para el reservorio ${reservorio.nombre} supera la capacidad disponible (${capacidadDisponible.toFixed(2)} L).`,
                },
                { status: 400 }
              );
            }
          }
        }
      }
    }

    const newFuelOperation = await prisma.$transaction(async (prisma) => {
      // Preparar datos para OperationReservorio
      const reservoirOpsToCreate = [];
      // Destinos (Carga)
      if (operationReservorio && operationReservorio.length > 0) {
        for (const op of operationReservorio) {
          if (op.reservorio_id && op.litros) {
            reservoirOpsToCreate.push({
              reservorio_id: op.reservorio_id,
              litros: op.litros,
              operationType: 'Carga', // Reservorio es destino
            });
          }
        }
      }
      // Origen (Consumo)
      if (reservorioId) {
        reservoirOpsToCreate.push({
          reservorio_id: reservorioId,
          litros: valorOperacionLitros,
          operationType: 'Consumo', // Reservorio es origen
        });
      }

      // Crear la operación de combustible y sus relaciones
      const createdOperation = await prisma.fuelOperation.create({
        data: {
          tipoOperacion,
          fecha: new Date(fecha),
          saldoInicio,
          valorOperacionDinero,
          valorOperacionLitros,
          saldoFinal,
          saldoFinalLitros,
          descripcion, // Guardar en la base de datos
          ubicacion_cupet, // Guardar en la base de datos
          ...(fuelCardId && {
            fuelCard: { connect: { id: fuelCardId } },
          }),
          ...(tipoCombustible_id && {
            tipoCombustible: { connect: { id: tipoCombustible_id } },
          }),
          ...(fuelDistributions &&
            fuelDistributions.length > 0 && {
              fuelDistributions: {
                create: fuelDistributions.map((dist: any) => ({
                  vehicleId: dist.vehicleId,
                  liters: dist.liters,
                })),
              },
            }),
          ...(reservoirOpsToCreate.length > 0 && {
            operationReservorio: {
              createMany: {
                data: reservoirOpsToCreate,
              },
            },
          }),
        },
      });

      // Actualizar saldo de FuelCard
      if (fuelCardId && saldoFinal !== undefined) {
        await prisma.fuelCard.update({
          where: { id: fuelCardId },
          data: { saldo: saldoFinal },
        });
      }

      // Actualizar capacidad de reservorios
      for (const op of reservoirOpsToCreate) {
        const reservorio = await prisma.reservorio.findUnique({
          where: { id: op.reservorio_id },
        });
        if (reservorio) {
          let newCapacity;
          if (op.operationType === 'Carga') {
            newCapacity = (reservorio.capacidad_actual || 0) + op.litros;
          } else if (op.operationType === 'Consumo') {
            newCapacity = (reservorio.capacidad_actual || 0) - op.litros;
          }

          if (newCapacity !== undefined) {
            await prisma.reservorio.update({
              where: { id: op.reservorio_id },
              data: { capacidad_actual: newCapacity },
            });
          }
        }
      }

      return createdOperation;
    });

    return NextResponse.json(newFuelOperation, { status: 201 });
  } catch (error) {
    console.error('Error creating fuel operation:', error);
    return NextResponse.json(
      { message: 'Error creating fuel operation', error },
      { status: 500 }
    );
  }
}
