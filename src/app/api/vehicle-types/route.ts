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
    const nombre = searchParams.get('nombre') || '';
    const cantidad_neumaticos = searchParams.get('cantidad_neumaticos') || '';
    const tipo_neumaticos = searchParams.get('tipo_neumaticos') || '';
    const capacidad_carga = searchParams.get('capacidad_carga') || '';
    const cantidad_conductores = searchParams.get('cantidad_conductores') || '';
    const ciclo_mantenimiento_km = searchParams.get('ciclo_mantenimiento_km') || '';
    const es_electrico = searchParams.get('es_electrico'); // 'true' or 'false' string
    const cantidad_baterias = searchParams.get('cantidad_baterias') || '';
    const tipo_bateria = searchParams.get('tipo_bateria') || '';
    const amperage = searchParams.get('amperage') || '';
    const voltage = searchParams.get('voltage') || '';
    const tipo_combustible = searchParams.get('tipo_combustible') || '';
    const capacidad_tanque = searchParams.get('capacidad_tanque') || '';
    const indice_consumo = searchParams.get('indice_consumo') || '';

    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Global search
    if (search) {
      whereClause.OR = [
        { nombre: { contains: search } },
        { tipo_neumaticos: { contains: search } },
        { capacidad_carga: { contains: search } },
        { tipo_bateria: { contains: search } },
        { tipo_combustible: { contains: search } },
      ];
    }

    // Column filters
    if (nombre) {
      whereClause.nombre = { contains: nombre };
    }
    if (cantidad_neumaticos) {
      whereClause.cantidad_neumaticos = parseFloat(cantidad_neumaticos);
    }
    if (tipo_neumaticos) {
      whereClause.tipo_neumaticos = { contains: tipo_neumaticos };
    }
    if (capacidad_carga) {
      whereClause.capacidad_carga = { contains: capacidad_carga };
    }
    if (cantidad_conductores) {
      whereClause.cantidad_conductores = parseFloat(cantidad_conductores);
    }
    if (ciclo_mantenimiento_km) {
      whereClause.ciclo_mantenimiento_km = parseFloat(ciclo_mantenimiento_km);
    }
    if (es_electrico !== null) {
      whereClause.es_electrico = es_electrico === 'true';
    }
    if (cantidad_baterias) {
      whereClause.cantidad_baterias = parseFloat(cantidad_baterias);
    }
    if (tipo_bateria) {
      whereClause.tipo_bateria = { contains: tipo_bateria };
    }
    if (amperage) {
      whereClause.amperage = parseFloat(amperage);
    }
    if (voltage) {
      whereClause.voltage = parseFloat(voltage);
    }
    if (tipo_combustible) {
      whereClause.tipo_combustible = { contains: tipo_combustible };
    }
    if (capacidad_tanque) {
      whereClause.capacidad_tanque = parseFloat(capacidad_tanque);
    }
    if (indice_consumo) {
      whereClause.indice_consumo = parseFloat(indice_consumo);
    }

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
