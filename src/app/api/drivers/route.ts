import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortOrder = searchParams.get('sortOrder') || 'asc'; // 'asc' or 'desc'
    const search = searchParams.get('search') || '';
    const nombre = searchParams.get('nombre') || '';
    const licencia = searchParams.get('licencia') || '';
    const fechaVencimientoLicenciaDesde = searchParams.get(
      'fechaVencimientoLicenciaDesde'
    );
    const fechaVencimientoLicenciaHasta = searchParams.get(
      'fechaVencimientoLicenciaHasta'
    );
    const carnet_peritage = searchParams.get('carnet_peritage'); // 'true' or 'false' string
    const estado = searchParams.get('estado') || '';
    const vehicleSearch = searchParams.get('vehicle') || ''; // For vehicle text search
    const unassigned = searchParams.get('unassigned'); // 'true' or 'false' string

    const skip = (page - 1) * limit;

    const where: any = {};

    // Global search
    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { licencia: { contains: search } },
        // Add other fields for global search if needed
      ];
    }

    // Column filters
    if (nombre) {
      where.nombre = { contains: nombre };
    }
    if (licencia) {
      where.licencia = { contains: licencia };
    }
    if (fechaVencimientoLicenciaDesde && fechaVencimientoLicenciaHasta) {
      where.fecha_vencimiento_licencia = {
        gte: new Date(fechaVencimientoLicenciaDesde),
        lte: new Date(fechaVencimientoLicenciaHasta),
      };
    }
    if (carnet_peritage !== null) {
      where.carnet_peritage = carnet_peritage === 'true';
    }
    if (estado) {
      where.estado = estado;
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

    if (unassigned === 'true') {
      where.vehicle = null;
    }

    const orderBy: any = {
      [sortBy]: sortOrder,
    };

    const drivers = await prisma.driver.findMany({
      skip,
      take: limit,
      where,
      orderBy,
      include: {
        vehicle: true, // Include the related vehicle
      },
    });

    const totalDrivers = await prisma.driver.count({ where });

    return NextResponse.json({
      data: drivers,
      total: totalDrivers,
      page,
      limit,
      totalPages: Math.ceil(totalDrivers / limit),
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const {
      nombre,
      licencia,
      fecha_vencimiento_licencia,
      carnet_peritage,
      photo,
      address,
      carnet,
      phone,
      estado,
      fecha_vencimiento_carnet,
      fecha_vencimiento_psicometrico,
    } = body;

    const parsedFechaVencimientoLicencia = new Date(fecha_vencimiento_licencia);

    const newDriver = await prisma.driver.create({
      data: {
        nombre,
        licencia,
        fecha_vencimiento_licencia: parsedFechaVencimientoLicencia,
        fecha_vencimiento_carnet,
        fecha_vencimiento_psicometrico,
        carnet_peritage,
        photo: photo || null, // Ensure undefined becomes null
        address: address || null, // Ensure undefined becomes null
        carnet: carnet || null, // Ensure undefined becomes null
        phone: phone || null, // Ensure undefined becomes null
        estado: estado || 'activo', // Default to 'activo' if not provided
      },
    });

    return NextResponse.json(newDriver, { status: 201 });
  } catch (error: any) {
    console.error('Error creating driver:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Licencia ya existe.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create driver', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return NextResponse.json(
    { message: 'PUT not implemented yet' },
    { status: 501 }
  );
}

export async function DELETE(request: Request) {
  return NextResponse.json(
    { message: 'DELETE not implemented yet' },
    { status: 501 }
  );
}
