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
      fuelCardId,
      fuelDistributions,
    } = body;

    const fuelCard = await prisma.fuelCard.findUnique({
      where: { id: fuelCardId },
    });

    if (!fuelCard) {
      return NextResponse.json(
        { message: 'Fuel card not found' },
        { status: 404 }
      );
    }

    const valorOperacionLitros = valorOperacionDinero / (fuelCard.saldo || 1);

    const lastOperation = await prisma.fuelOperation.findFirst({
      where: { fuelCardId, id: { not: parseInt(id) } },
      orderBy: { fecha: 'desc' },
    });
    const saldoInicio = lastOperation ? lastOperation.saldoFinal : 0;

    let saldoFinal;
    if (tipoOperacion === 'Carga') {
      saldoFinal = saldoInicio + valorOperacionDinero;
    } else if (tipoOperacion === 'Consumo') {
      saldoFinal = (saldoInicio || 0) - valorOperacionDinero;
    } else {
      return NextResponse.json(
        { message: 'Invalid tipoOperacion' },
        { status: 400 }
      );
    }

    const saldoFinalLitros = saldoFinal / (fuelCard.saldo || 1);

    const updatedFuelOperation = await prisma.fuelOperation.update({
      where: { id: parseInt(id) },
      data: {
        tipoOperacion,
        fecha: new Date(fecha),
        saldoInicio: saldoInicio || 0,
        valorOperacionDinero,
        valorOperacionLitros,
        saldoFinal,
        saldoFinalLitros,
        fuelCardId,
        fuelDistributions: {
          deleteMany: {}, // Delete existing distributions
          createMany: {
            data:
              tipoOperacion === 'Consumo' &&
              fuelDistributions &&
              fuelDistributions.length > 0
                ? fuelDistributions.map((dist: any) => ({
                    vehicleId: dist.vehicleId,
                    liters: dist.liters,
                  }))
                : [],
          },
        },
      },
    });

    return NextResponse.json(updatedFuelOperation);
  } catch (error) {
    console.error('Error updating fuel operation:', error);
    return NextResponse.json(
      { message: 'Error updating fuel operation', error },
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
    await prisma.fuelOperation.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({
      message: 'Fuel operation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting fuel operation:', error);
    return NextResponse.json(
      { message: 'Error deleting fuel operation', error },
      { status: 500 }
    );
  }
}
