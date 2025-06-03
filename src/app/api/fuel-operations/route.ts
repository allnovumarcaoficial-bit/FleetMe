import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma types

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const orderBy = searchParams.get('orderBy') || 'fecha';
    const orderDirection = searchParams.get('orderDirection') || 'desc';
    const fuelCardId = searchParams.get('fuelCardId'); // Get fuelCardId from search params

    const skip = (page - 1) * limit;

    const where: Prisma.FuelOperationWhereInput = {
      ...(search
        ? {
            OR: [
              { tipoOperacion: { contains: search } },
              { fuelCard: { numeroDeTarjeta: { contains: search } } },
              { vehicle: { matricula: { contains: search } } },
            ],
          }
        : {}),
      ...(fuelCardId ? { fuelCardId: parseInt(fuelCardId) } : {}), // Add fuelCardId filter
    };

    const fuelOperations = await prisma.fuelOperation.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [orderBy]: orderDirection as Prisma.SortOrder, // Explicitly cast orderDirection
      },
      include: {
        fuelCard: true,
        vehicle: true,
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
    return NextResponse.json({ message: 'Error fetching fuel operations', error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tipoOperacion, fecha, valorOperacionDinero, fuelCardId, vehicleId } = body;

    // Fetch the fuel card to get its price and type
    const fuelCard = await prisma.fuelCard.findUnique({
      where: { id: fuelCardId },
    });

    if (!fuelCard) {
      return NextResponse.json({ message: 'Fuel card not found' }, { status: 404 });
    }

    // Calculate valorOperacionLitros
    const valorOperacionLitros = valorOperacionDinero / fuelCard.precioCombustible;

    // Determine saldoInicio
    const lastOperation = await prisma.fuelOperation.findFirst({
      where: { fuelCardId },
      orderBy: { fecha: 'desc' },
    });
    const saldoInicio = lastOperation ? lastOperation.saldoFinal : 0;

    // Calculate saldoFinal and saldoFinalLitros
    let saldoFinal;
    if (tipoOperacion === 'Carga') {
      saldoFinal = saldoInicio + valorOperacionDinero;
    } else if (tipoOperacion === 'Consumo') {
      saldoFinal = saldoInicio - valorOperacionDinero;
    } else {
      return NextResponse.json({ message: 'Invalid tipoOperacion' }, { status: 400 });
    }

    const saldoFinalLitros = saldoFinal / fuelCard.precioCombustible;

    // Validate vehicleId for 'Consumo' operations
    if (tipoOperacion === 'Consumo' && !vehicleId) {
      return NextResponse.json({ message: 'Vehicle is required for Consumo operations' }, { status: 400 });
    }
    if (tipoOperacion === 'Carga' && vehicleId) {
        return NextResponse.json({ message: 'Vehicle should not be selected for Carga operations' }, { status: 400 });
    }

    const newFuelOperation = await prisma.fuelOperation.create({
      data: {
        tipoOperacion,
        fecha: new Date(fecha), // Ensure fecha is a valid Date object
        saldoInicio,
        valorOperacionDinero,
        valorOperacionLitros,
        saldoFinal,
        saldoFinalLitros,
        fuelCardId,
        vehicleId: tipoOperacion === 'Consumo' ? vehicleId : null, // Ensure vehicleId is null for Carga
      },
    });

    return NextResponse.json(newFuelOperation, { status: 201 });
  } catch (error) {
    console.error('Error creating fuel operation:', error);
    return NextResponse.json({ message: 'Error creating fuel operation', error }, { status: 500 });
  }
}
