import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Ajusta la ruta según tu estructura

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const search = searchParams.get('search') || '';
    const nombre = searchParams.get('nombre') || '';
    const precio = searchParams.get('precio') || '';
    const tipoCombustibleEnum = searchParams.get('tipoCombustibleEnum') || '';
    const skip = (page - 1) * limit;

    const where: any = {};

    // Global search
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { tipoCombustibleEnum: { equals: search } },
        // Puedes agregar más campos si lo necesitas
      ];
    }

    // Column filters
    if (nombre) {
      where.nombre = { contains: nombre, mode: 'insensitive' };
    }
    if (precio) {
      where.precio = parseFloat(precio);
    }
    if (tipoCombustibleEnum) {
      where.tipoCombustibleEnum = tipoCombustibleEnum;
    }

    const orderBy: any = {
      [sortBy]: sortOrder,
    };

    const tipos = await prisma.tipoCombustible.findMany({
      skip,
      take: limit,
      where,
      orderBy,
    });

    const totalTipos = await prisma.tipoCombustible.count({ where });

    return NextResponse.json({
      data: tipos,
      total: totalTipos,
      page,
      limit,
      totalPages: Math.ceil(totalTipos / limit),
    });
  } catch (error) {
    console.error('Error fetching tipoCombustible:', error);
    return NextResponse.json(
      { error: 'Fallo en la obtención de tipoCombustible' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { nombre, precio, fechaUpdate, tipoCombustibleEnum } = body;

    const newTipoCombustible = await prisma.tipoCombustible.create({
      data: {
        nombre,
        precio: parseFloat(precio),
        fechaUpdate,
        tipoCombustibleEnum: tipoCombustibleEnum || undefined,
      },
    });

    return NextResponse.json(newTipoCombustible, { status: 201 });
  } catch (error: any) {
    console.error('Error creating fuel card:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Número de Tarjeta ya existe.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create fuel card', details: error.message },
      { status: 500 }
    );
  }
}
