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
        { numeroDeTarjeta: { contains: search, mode: 'insensitive' } },
        { tipoDeTarjeta: { contains: search, mode: 'insensitive' } },
        { tipoDeCombustible: { contains: search, mode: 'insensitive' } },
        { moneda: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {
      [sortBy]: sortOrder,
    };

    const fuelCards = await prisma.fuelCard.findMany({
      skip,
      take: limit,
      where,
      orderBy,
    });

    const totalFuelCards = await prisma.fuelCard.count({ where });

    return NextResponse.json({
      data: fuelCards,
      total: totalFuelCards,
      page,
      limit,
      totalPages: Math.ceil(totalFuelCards / limit),
    });
  } catch (error) {
    console.error('Error fetching fuel cards:', error);
    return NextResponse.json({ error: 'Failed to fetch fuel cards' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      numeroDeTarjeta,
      tipoDeTarjeta,
      tipoDeCombustible,
      precioCombustible,
      moneda,
      fechaVencimiento,
      esReservorio,
    } = body;

    const parsedFechaVencimiento = new Date(fechaVencimiento);

    const newFuelCard = await prisma.fuelCard.create({
      data: {
        numeroDeTarjeta,
        tipoDeTarjeta,
        tipoDeCombustible,
        precioCombustible: parseFloat(precioCombustible),
        moneda,
        fechaVencimiento: parsedFechaVencimiento,
        esReservorio: Boolean(esReservorio),
      },
    });

    return NextResponse.json(newFuelCard, { status: 201 });
  } catch (error: any) {
    console.error('Error creating fuel card:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Número de Tarjeta ya existe.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create fuel card', details: error.message }, { status: 500 });
  }
}
