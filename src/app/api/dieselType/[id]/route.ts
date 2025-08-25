import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid driver ID' }, { status: 400 });
    }

    const vehicle = await prisma.tipoCombustible.findUnique({
      where: { id },
      include: {
        reservorios: true,
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
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid vehicle ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nombre, precio, fechaUpdate, moneda } = body;
    // Validate required date fields
    if (!nombre) {
      return NextResponse.json(
        { error: 'EL nombre del reservorio es requerido' },
        { status: 400 }
      );
    }
    if (!precio) {
      return NextResponse.json(
        { error: 'El precio es requerido.' },
        { status: 400 }
      );
    }
    if (!fechaUpdate) {
      return NextResponse.json(
        { error: 'La fecha de actualización es requerida' },
        { status: 400 }
      );
    }
    if (!moneda) {
      return NextResponse.json(
        { error: 'El tipo de combustible es requerido' },
        { status: 400 }
      );
    }
    const updatedTipoCombustible = await prisma.tipoCombustible.update({
      where: { id },
      data: {
        nombre,
        precio,
        fechaUpdate,
        moneda: moneda,
      },
      include: {
        reservorios: true,
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
    return NextResponse.json(updatedTipoCombustible);
  } catch (error: any) {
    console.error('Error updating tipo combustible:', error);
    return NextResponse.json(
      { error: 'Failed to update tipo combustible', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid tipo combustible ID' },
        { status: 400 }
      );
    }

    await prisma.tipoCombustible.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Tipo de combustible deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting tipo de combustible:', error);
    return NextResponse.json(
      { error: 'Failed to delete tipo de combustible', details: error.message },
      { status: 500 }
    );
  }
}
