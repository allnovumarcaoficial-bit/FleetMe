import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortOrder = searchParams.get('sortOrder') || 'asc'; // 'asc' or 'desc'
    const search = searchParams.get('search') || '';
    const vehicleId = searchParams.get('vehicleId');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { tipo: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (vehicleId) {
      where.vehicleId = parseInt(vehicleId);
    }

    const orderBy: any = {
      [sortBy]: sortOrder,
    };

    const maintenances = await prisma.mantenimiento.findMany({
      skip,
      take: limit,
      where,
      orderBy,
      include: {
        vehicle: true, // Include vehicle details
      },
    });

    const totalMantenimientos = await prisma.mantenimiento.count({ where });

    return NextResponse.json({
      data: maintenances,
      total: totalMantenimientos,
      page,
      limit,
      totalPages: Math.ceil(totalMantenimientos / limit),
    });
  } catch (error) {
    console.error('Error fetching maintenances:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenances' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
      vehicleId,
    } = body;

    const parsedFecha = new Date(fecha);

    const newMantenimiento = await prisma.mantenimiento.create({
      data: {
        tipo,
        fecha: parsedFecha,
        costo: parseFloat(costo),
        descripcion,
        lista_de_piezas: JSON.stringify(lista_de_piezas), // Store as JSON string
        cambio_de_pieza,
        numero_serie_anterior: cambio_de_pieza ? numero_serie_anterior : null,
        numero_serie_nueva: cambio_de_pieza ? numero_serie_nueva : null,
        vehicle: {
          connect: { id: vehicleId },
        },
      },
    });

    return NextResponse.json(newMantenimiento, { status: 201 });
  } catch (error: any) {
    console.error('Error creating maintenance:', error);
    return NextResponse.json({ error: 'Failed to create maintenance', details: error.message }, { status: 500 });
  }
}
