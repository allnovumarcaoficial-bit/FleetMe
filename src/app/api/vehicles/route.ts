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

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { marca: { contains: search, mode: 'insensitive' } },
        { modelo: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
        { matricula: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {
      [sortBy]: sortOrder,
    };

    const vehicles = await prisma.vehicle.findMany({
      skip,
      take: limit,
      where,
      orderBy,
      // Removed include: { tipoVehiculo: true } as there's no direct relation anymore
    });

    const totalVehicles = await prisma.vehicle.count({ where });

    return NextResponse.json({
      data: vehicles,
      total: totalVehicles,
      page,
      limit,
      totalPages: Math.ceil(totalVehicles / limit),
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

// Placeholder for POST, PUT, DELETE
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation (more robust validation should be done on the client and potentially server-side schema validation)
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
      listado_municipios, // This will be a JSON string
      tipoNombre, // Changed from tipoVehiculoId
      listado_idconductores, // This will be an array of numbers
    } = body;

    // Convert date strings to Date objects
    const parsedFechaCompra = new Date(fecha_compra);
    const parsedFechaVencimientoLicenciaOperativa = new Date(fecha_vencimiento_licencia_operativa);
    const parsedFechaVencimientoCirculacion = new Date(fecha_vencimiento_circulacion);
    const parsedFechaVencimientoSomaton = new Date(fecha_vencimiento_somaton);

    // Create the vehicle
    const newVehicle = await prisma.vehicle.create({
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
        listado_municipios, // Stored as JSON string
        tipoNombre, // Changed from tipoVehiculoId
        listado_idconductores, // Stored as array of numbers
      },
    });

    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    // Handle unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'VIN o Matrícula ya existen.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create vehicle', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return NextResponse.json({ message: 'PUT not implemented yet' }, { status: 501 });
}

export async function DELETE(request: Request) {
  return NextResponse.json({ message: 'DELETE not implemented yet' }, { status: 501 });
}
