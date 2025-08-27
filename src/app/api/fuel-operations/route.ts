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
      },
    });

    const total = await prisma.fuelOperation.count({ where });

    return NextResponse.json({
      data: fuelOperations,
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

      const lastOperation = await prisma.fuelOperation.findFirst({
        where: { fuelCardId },
        orderBy: { fecha: 'desc' },
      });
      saldoInicio = lastOperation ? lastOperation.saldoFinal : fuelCard.saldo;

      if (tipoOperacion === 'Carga') {
        saldoFinal = (saldoInicio || 0) + valorOperacionDinero;
      } else if (tipoOperacion === 'Consumo') {
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

    const newFuelOperation = await prisma.fuelOperation.create({
      data: {
        tipoOperacion,
        fecha: new Date(fecha),
        saldoInicio,
        valorOperacionDinero,
        valorOperacionLitros, // Usar el valor del frontend
        saldoFinal,
        saldoFinalLitros, // Usar el valor del frontend
        ...(fuelCardId && {
          fuelCard: {
            connect: {
              id: fuelCardId,
            },
          },
        }),
        ...(tipoCombustible_id && {
          tipoCombustible: {
            connect: {
              id: tipoCombustible_id,
            },
          },
        }),
        ...(tipoOperacion === 'Consumo' &&
          fuelDistributions &&
          fuelDistributions.length > 0 && {
            fuelDistributions: {
              createMany: {
                data: fuelDistributions.map((dist: any) => ({
                  vehicleId: dist.vehicleId,
                  liters: dist.liters,
                })),
              },
            },
          }),
        // Añadir operationReservorio si aplica
        ...(operationReservorio &&
          operationReservorio.length > 0 && {
            operationReservorio: {
              createMany: {
                data: operationReservorio.map((opRes: any) => ({
                  reservorio_id: opRes.reservorio_id,
                  litros: opRes.litros, // Añadir el campo litros
                })),
              },
            },
          }),
      },
    });

    // Actualizar el saldo de la FuelCard si hay fuelCardId
    if (fuelCardId && saldoFinal !== undefined) {
      await prisma.fuelCard.update({
        where: { id: fuelCardId },
        data: { saldo: saldoFinal },
      });
    }

    // Lógica para actualizar la capacidad del reservorio
    if (reservorioId && saldoFinalLitros !== undefined) {
      // Si la operación es con un reservorio principal (ya sea consumo o carga)
      await prisma.reservorio.update({
        where: { id: reservorioId },
        data: {
          capacidad_actual: saldoFinalLitros,
        },
      });
    } else if (
      tipoOperacion === 'Consumo' &&
      operationReservorio &&
      operationReservorio.length > 0
    ) {
      // Si es una operación de consumo que distribuye a otros reservorios (no el principal)
      for (const opRes of operationReservorio) {
        const reservorio = await prisma.reservorio.findUnique({
          where: { id: opRes.reservorio_id },
        });

        if (reservorio) {
          await prisma.reservorio.update({
            where: { id: opRes.reservorio_id },
            data: {
              capacidad_actual: reservorio.capacidad_actual + opRes.litros, // Sumar litros si se distribuye a otro reservorio
            },
          });
        }
      }
    }

    return NextResponse.json(newFuelOperation, { status: 201 });
  } catch (error) {
    console.error('Error creating fuel operation:', error);
    return NextResponse.json(
      { message: 'Error creating fuel operation', error },
      { status: 500 }
    );
  }
}
