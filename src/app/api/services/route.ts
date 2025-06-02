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
    const vehicleId = searchParams.get('vehicleId');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { tipoServicio: { contains: search, mode: 'insensitive' } },
        { estado: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { origen: { contains: search, mode: 'insensitive' } },
        { destino: { contains: search, mode: 'insensitive' } },
      ];
    }

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
