import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const vehicleTypes = await prisma.vehicleType.findMany();
    return NextResponse.json({ data: vehicleTypes });
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle types' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    const newVehicleType = await prisma.vehicleType.create({
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

    return NextResponse.json(newVehicleType, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehicle type:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El nombre del tipo de vehículo ya existe.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create vehicle type', details: error.message }, { status: 500 });
  }
}
