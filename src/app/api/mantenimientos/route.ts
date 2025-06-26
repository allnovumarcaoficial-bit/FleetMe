import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortOrder = searchParams.get('sortOrder') || 'asc'; // 'asc' or 'desc'
    const search = searchParams.get('search') || '';
    const tipo = searchParams.get('tipo') || '';
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const costo = searchParams.get('costo') || '';
    const estado = searchParams.get('estado') || '';
    const descripcion = searchParams.get('descripcion') || '';
    const vehicleSearch = searchParams.get('vehicle') || '';
    const vehicleId = searchParams.get('vehicleId'); // Keep this for specific vehicle filtering

    const skip = (page - 1) * limit;

    const where: any = {};

    // Global search
    if (search) {
      where.OR = [
        { tipo: { contains: search } },
        { descripcion: { contains: search } },
        // Add other fields for global search if needed
      ];
    }

    // Column filters
    if (tipo) {
      where.tipo = { contains: tipo };
    }
    if (fechaDesde && fechaHasta) {
      where.fecha = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }
    if (costo) {
      where.costo = parseFloat(costo); // Assuming exact match for cost
    }
    if (estado) {
      where.estado = estado;
    }
    if (descripcion) {
      where.descripcion = { contains: descripcion };
    }
    if (vehicleSearch) {
      where.vehicle = {
        OR: [
          { marca: { contains: vehicleSearch } },
          { modelo: { contains: vehicleSearch } },
          { matricula: { contains: vehicleSearch } },
        ],
      };
    }

    // Specific vehicleId filter (if provided as a prop to the table component)
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
