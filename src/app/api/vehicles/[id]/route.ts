import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      marca,
      modelo,
      vin,
      matricula,
      fecha_compra,
      fecha_vencimiento_licencia_operativa,
      fecha_vencimiento_circulacion,
      fecha_vencimiento_somaton,
      estado,
      gps,
      listado_municipios,
    } = body;

    const parsedFechaCompra = new Date(fecha_compra);
    const parsedFechaVencimientoLicenciaOperativa = new Date(fecha_vencimiento_licencia_operativa);
    const parsedFechaVencimientoCirculacion = new Date(fecha_vencimiento_circulacion);
    const parsedFechaVencimientoSomaton = new Date(fecha_vencimiento_somaton);

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        marca,
        modelo,
        vin,
        matricula,
        fecha_compra: parsedFechaCompra,
        fecha_vencimiento_licencia_operativa: parsedFechaVencimientoLicenciaOperativa,
        fecha_vencimiento_circulacion: parsedFechaVencimientoCirculacion,
        fecha_vencimiento_somaton: parsedFechaVencimientoSomaton,
        estado,
        gps,
        listado_municipios,
      },
    });

    return NextResponse.json(updatedVehicle);
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'VIN o Matrícula ya existen.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update vehicle', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 });
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Vehicle deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    if (error.code === 'P2025') { // Record to delete does not exist
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete vehicle', details: error.message }, { status: 500 });
  }
}
