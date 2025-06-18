import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid maintenance ID' }, { status: 400 });
    }

    const maintenance = await prisma.mantenimiento.findUnique({
      where: { id },
      include: {
        vehicle: true, // Include vehicle details
      },
    });

    if (!maintenance) {
      return NextResponse.json({ error: 'Maintenance not found' }, { status: 404 });
    }

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid maintenance ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      tipo,
      fecha,
      costo,
      descripcion,
      lista_de_piezas,
      cambio_de_pieza,
      numero_serie_anterior,
      numero_serie_nueva,
      estado, // Add estado here
      vehicleId,
    } = body;

    const parsedFecha = new Date(fecha);

    const updatedMantenimiento = await prisma.mantenimiento.update({
      where: { id },
      data: {
        tipo,
        fecha: parsedFecha,
        costo: parseFloat(costo),
        descripcion,
        lista_de_piezas: JSON.stringify(lista_de_piezas),
        cambio_de_pieza,
        numero_serie_anterior: cambio_de_pieza ? numero_serie_anterior : null,
        numero_serie_nueva: cambio_de_pieza ? numero_serie_nueva : null,
        estado, // Add estado here
        vehicle: {
          connect: { id: vehicleId },
        },
      },
    });

    return NextResponse.json(updatedMantenimiento);
  } catch (error: any) {
    console.error('Error updating maintenance:', error);
    if (error.code === 'P2025') { // Record to update does not exist
      return NextResponse.json({ error: 'Maintenance not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update maintenance', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid maintenance ID' }, { status: 400 });
    }

    await prisma.mantenimiento.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Maintenance deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting maintenance:', error);
    if (error.code === 'P2025') { // Record to delete does not exist
      return NextResponse.json({ error: 'Maintenance not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete maintenance', details: error.message }, { status: 500 });
  }
}
