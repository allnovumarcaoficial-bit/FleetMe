import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { tipo_neumaticos: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const totalVehicleTypes = await prisma.vehicleType.count({
      where: whereClause,
    });

    const vehicleTypes = await prisma.vehicleType.findMany({
      skip,
      take: limit,
      where: whereClause,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(totalVehicleTypes / limit);

    return NextResponse.json({
      data: vehicleTypes,
      total: totalVehicleTypes,
      page,
      limit,
      totalPages,
    });
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
