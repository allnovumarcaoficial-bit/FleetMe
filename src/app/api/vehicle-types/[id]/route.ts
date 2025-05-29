import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid vehicle type ID' }, { status: 400 });
    }

    const vehicleType = await prisma.vehicleType.findUnique({
      where: { id },
    });

    if (!vehicleType) {
      return NextResponse.json({ error: 'Vehicle type not found' }, { status: 404 });
    }

    return NextResponse.json(vehicleType);
  } catch (error) {
    console.error('Error fetching vehicle type:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle type' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid vehicle type ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      nombre,
      cantidad_neumaticos,
      tipo_neumaticos,
      capacidad_carga,
      cantidad_conductores,
      ciclo_mantenimiento_km,
      es_electrico,
      cantidad_baterias,
      tipo_bateria,
      amperage,
      voltage,
      tipo_combustible,
      capacidad_tanque,
      indice_consumo,
    } = body;

    const updatedVehicleType = await prisma.vehicleType.update({
      where: { id },
      data: {
        nombre,
        cantidad_neumaticos,
        tipo_neumaticos,
        capacidad_carga,
        cantidad_conductores,
        ciclo_mantenimiento_km,
        es_electrico,
        cantidad_baterias,
        tipo_bateria,
        amperage,
        voltage,
        tipo_combustible,
        capacidad_tanque,
        indice_consumo,
      },
    });

    return NextResponse.json(updatedVehicleType);
  } catch (error: any) {
    console.error('Error updating vehicle type:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El nombre del tipo de vehículo ya existe.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update vehicle type', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid vehicle type ID' }, { status: 400 });
    }

    await prisma.vehicleType.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Vehicle type deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting vehicle type:', error);
    if (error.code === 'P2025') { // Record to delete does not exist
      return NextResponse.json({ error: 'Vehicle type not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete vehicle type', details: error.message }, { status: 500 });
  }
}
