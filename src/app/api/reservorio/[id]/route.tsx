import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const vehicle = await prisma.reservorio.findUnique({
      where: { id },
      include: {
        tipoCombustible: true,
        operationReservorio: true, // Include related operationReservorio data
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle' },
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
    const { nombre, capacidad_actual, capacidad_total, tipoCombustibleId } =
      body;
    // Validate required date fields
    if (!nombre) {
      return NextResponse.json(
        { error: 'EL nombre del reservorio es requerido' },
        { status: 400 }
      );
    }
    if (!capacidad_actual) {
      return NextResponse.json(
        { error: 'La capacidad actual es requerida.' },
        { status: 400 }
      );
    }
    if (!capacidad_total) {
      return NextResponse.json(
        { error: 'La capacidad total es requerida' },
        { status: 400 }
      );
    }
    if (!tipoCombustibleId) {
      return NextResponse.json(
        { error: 'El tipo de combustible es requerido' },
        { status: 400 }
      );
    }

    const updatedReservorio = await prisma.reservorio.update({
      where: { id },
      data: {
        nombre,
        capacidad_actual,
        capacidad_total,
        tipoCombustibleId,
      },
      include: {
        tipoCombustible: true,
      },
    });
    //  await prisma.driver.updateMany({
    //   where: { vehicleId: Number(id) },
    //   data: { vehicleId: null }
    // });
    // // Segundo: Conectar los nuevos conductores
    // console.log(body)
    // if (driverIds) {
    //   const a = await prisma.driver.updateMany({
    //     where: { id: { in: driverIds} },
    //     data: { vehicleId: Number(id) }
    //   });
    //   console.log(a)
    // }
    return NextResponse.json(updatedReservorio);
  } catch (error: any) {
    console.error('Error updating reservorio:', error);
    return NextResponse.json(
      { error: 'Failed to update reservorio', details: error.message },
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

    await prisma.reservorio.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Reservorio deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting reservorio:', error);
    return NextResponse.json(
      { error: 'Failed to delete reservorio', details: error.message },
      { status: 500 }
    );
  }
}
