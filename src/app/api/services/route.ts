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
    const tipoServicio = searchParams.get('tipoServicio') || '';
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const odometroInicial = searchParams.get('odometroInicial') || '';
    const odometroFinal = searchParams.get('odometroFinal') || '';
    const kilometrosRecorridos = searchParams.get('kilometrosRecorridos') || '';
    const estado = searchParams.get('estado') || '';
    const vehicleSearch = searchParams.get('vehicle') || '';
    const vehicleId = searchParams.get('vehicleId'); // Keep this for specific vehicle filtering

    const skip = (page - 1) * limit;

    const where: any = {};

    // Global search
    if (search) {
      where.OR = [
        { tipoServicio: { contains: search } },
        { estado: { contains: search } },
        { descripcion: { contains: search } },
        { origen: { contains: search } },
        { destino: { contains: search } },
        { vehicle: { matricula: { contains: search } } },
        { vehicle: { marca: { contains: search } } },
        { vehicle: { modelo: { contains: search } } },
      ];
    }

    // Column filters
    if (tipoServicio) {
      where.tipoServicio = tipoServicio;
    }
    if (fechaDesde && fechaHasta) {
      where.fecha = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }
    if (odometroInicial) {
      where.odometroInicial = parseFloat(odometroInicial);
    }
    if (odometroFinal) {
      where.odometroFinal = parseFloat(odometroFinal);
    }
    if (kilometrosRecorridos) {
      where.kilometrosRecorridos = parseFloat(kilometrosRecorridos);
    }
    if (estado) {
      where.estado = estado;
    }
    if (vehicleSearch) {
      where.vehicle = {
        OR: [
          { matricula: { contains: vehicleSearch } },
          { marca: { contains: vehicleSearch } },
          { modelo: { contains: vehicleSearch } },
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

    const services = await prisma.servicio.findMany({
      skip,
      take: limit,
      where,
      orderBy,
      include: {
        vehicle: {
          select: {
            matricula: true,
            marca: true,
            modelo: true,
          },
        },
      },
    });

    const totalServices = await prisma.servicio.count({ where });

    return NextResponse.json({
      data: services,
      total: totalServices,
      page,
      limit,
      totalPages: Math.ceil(totalServices / limit),
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      tipoServicio,
      fecha,
      odometroInicial,
      odometroFinal,
      cantidadPedidos,
      origen,
      destino,
      descripcion,
      kilometrosRecorridos,
      estado,
      vehicleId,
    } = body;

    const parsedFecha = new Date(fecha);

    const newServicio = await prisma.servicio.create({
      data: {
        tipoServicio,
        fecha: parsedFecha,
        odometroInicial: parseInt(odometroInicial),
        odometroFinal: odometroFinal ? parseInt(odometroFinal) : null,
        cantidadPedidos: cantidadPedidos ? parseInt(cantidadPedidos) : null,
        origen,
        destino,
        descripcion,
        kilometrosRecorridos: parseInt(kilometrosRecorridos),
        estado,
        vehicle: {
          connect: { id: parseInt(vehicleId) },
        },
      },
    });

    return NextResponse.json(newServicio, { status: 201 });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service', details: error.message }, { status: 500 });
  }
}
