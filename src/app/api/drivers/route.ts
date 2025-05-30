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

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { licencia: { contains: search, mode: 'insensitive' } },
      ];
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
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      nombre,
      licencia,
      fecha_vencimiento_licencia,
      carnet_peritage,
      vehicleId, // Optional: for connecting an existing vehicle
    } = body;

    const parsedFechaVencimientoLicencia = new Date(fecha_vencimiento_licencia);

    // Check if the provided vehicleId already has a driver
    if (vehicleId) {
      const existingVehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: { driver: true },
      });

      if (existingVehicle && existingVehicle.driver) {
        return NextResponse.json({ error: 'El vehículo seleccionado ya tiene un conductor asignado.' }, { status: 409 });
      }
    }

    const newDriver = await prisma.driver.create({
      data: {
        nombre,
        licencia,
        fecha_vencimiento_licencia: parsedFechaVencimientoLicencia,
        carnet_peritage,
        ...(vehicleId && {
          vehicle: {
            connect: { id: vehicleId },
          },
        }),
      },
    });

    return NextResponse.json(newDriver, { status: 201 });
  } catch (error: any) {
    console.error('Error creating driver:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Licencia ya existe.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create driver', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return NextResponse.json({ message: 'PUT not implemented yet' }, { status: 501 });
}

export async function DELETE(request: Request) {
  return NextResponse.json({ message: 'DELETE not implemented yet' }, { status: 501 });
}
