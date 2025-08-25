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
    const nombre = searchParams.get('nombre') || '';
    const capacidad_actual = searchParams.get('capacidad_actual') || '';
    const tipoDeCombustible = searchParams.get('tipoDeCombustible') || '';
    const capacidad_total = searchParams.get('precioCombustible') || '';
    const precio = searchParams.get('precio') || '';
    const skip = (page - 1) * limit;

    const where: any = {};

    // Global search
    if (search) {
      where.OR = [
        { numeroDeTarjeta: { contains: search } },
        { tipoDeTarjeta: { contains: search } },
        { tipoDeCombustible: { contains: search } },
        // Add other fields for global search if needed
      ];
    }

    // Column filters
    if (nombre) {
      where.nombre = { contains: nombre };
    }
    if (capacidad_actual) {
      where.capacidad_actual = parseFloat(capacidad_total);
    }
    if (tipoDeCombustible) {
      where.tipoDeCombustible = tipoDeCombustible;
    }
    if (capacidad_total) {
      // Assuming exact match for price, or you might need range/numeric comparison
      where.capacidad_total = parseFloat(capacidad_total);
    }
    if (precio) {
      where.tipoCombustibleId.precio = { contains: parseFloat(precio) };
    }
    const orderBy: any = {
      [sortBy]: sortOrder,
    };

    const reservorio = await prisma.reservorio.findMany({
      skip,
      take: limit,
      where,
      include: {
        tipoCombustible: true, // Include related tipoCombustible data
      },
      orderBy,
    });

    const totalReservorio = await prisma.reservorio.count({ where });

    return NextResponse.json({
      data: reservorio,
      total: totalReservorio,
      page,
      limit,
      totalPages: Math.ceil(totalReservorio / limit),
    });
  } catch (error) {
    console.error('Error fetching reservotio:', error);
    return NextResponse.json(
      { error: 'Fallo en la obtención del reservorio' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { nombre, capacidad_actual, capacidad_total, tipoCombustibleId } =
      body;
    console.log('Creating reservorio with data:', body);
    const newReservorio = await prisma.reservorio.create({
      data: {
        nombre,
        capacidad_actual: parseFloat(capacidad_actual),
        capacidad_total: parseFloat(capacidad_total),
        tipoCombustibleId: parseInt(tipoCombustibleId) || undefined, // Ensure this is optional
      },
    });

    return NextResponse.json(newReservorio, { status: 201 });
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
