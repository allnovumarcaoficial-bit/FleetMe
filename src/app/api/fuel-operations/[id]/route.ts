import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const fuelOperation = await prisma.fuelOperation.findUnique({
      where: { id: parseInt(id) },
      include: {
        fuelCard: true,
        vehicle: true,
      },
    });

    if (!fuelOperation) {
      return NextResponse.json({ message: 'Fuel operation not found' }, { status: 404 });
    }

    return NextResponse.json(fuelOperation);
  } catch (error) {
    console.error('Error fetching fuel operation:', error);
    return NextResponse.json({ message: 'Error fetching fuel operation', error }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
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

    // Determine saldoInicio (recalculate based on the latest operation for the selected card)
    const lastOperation = await prisma.fuelOperation.findFirst({
      where: { fuelCardId, id: { not: parseInt(id) } }, // Exclude the current operation being updated
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

    const updatedFuelOperation = await prisma.fuelOperation.update({
      where: { id: parseInt(id) },
      data: {
        tipoOperacion,
        fecha: new Date(fecha),
        saldoInicio,
        valorOperacionDinero,
        valorOperacionLitros,
        saldoFinal,
        saldoFinalLitros,
        fuelCardId,
        vehicleId: tipoOperacion === 'Consumo' ? vehicleId : null,
      },
    });

    return NextResponse.json(updatedFuelOperation);
  } catch (error) {
    console.error('Error updating fuel operation:', error);
    return NextResponse.json({ message: 'Error updating fuel operation', error }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.fuelOperation.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: 'Fuel operation deleted successfully' });
  } catch (error) {
    console.error('Error deleting fuel operation:', error);
    return NextResponse.json({ message: 'Error deleting fuel operation', error }, { status: 500 });
  }
}
