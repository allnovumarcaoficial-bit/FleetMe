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
    const numeroDeTarjeta = searchParams.get('numeroDeTarjeta') || '';
    const tipoDeTarjeta = searchParams.get('tipoDeTarjeta') || '';
    const tipoDeCombustible = searchParams.get('tipoDeCombustible') || '';
    const precioCombustible = searchParams.get('precioCombustible') || '';
    const moneda = searchParams.get('moneda') || '';
    const fechaVencimientoDesde = searchParams.get('fechaVencimientoDesde');
    const fechaVencimientoHasta = searchParams.get('fechaVencimientoHasta');
    const esReservorio = searchParams.get('esReservorio'); // 'true' or 'false' string

    const skip = (page - 1) * limit;

    const where: any = {};

    // Global search
    if (search) {
      where.OR = [
        { numeroDeTarjeta: { contains: search } },
        { tipoDeTarjeta: { contains: search } },
        { tipoDeCombustible: { contains: search } },
        { moneda: { contains: search } },
        // Add other fields for global search if needed
      ];
    }

    // Column filters
    if (numeroDeTarjeta) {
      where.numeroDeTarjeta = { contains: numeroDeTarjeta };
    }
    if (tipoDeTarjeta) {
      where.tipoDeTarjeta = tipoDeTarjeta;
    }
    if (tipoDeCombustible) {
      where.tipoDeCombustible = tipoDeCombustible;
    }
    if (precioCombustible) {
      // Assuming exact match for price, or you might need range/numeric comparison
      where.precioCombustible = parseFloat(precioCombustible);
    }
    if (moneda) {
      where.moneda = { contains: moneda };
    }
    if (fechaVencimientoDesde && fechaVencimientoHasta) {
      where.fechaVencimiento = {
        gte: new Date(fechaVencimientoDesde),
        lte: new Date(fechaVencimientoHasta),
      };
    }
    if (esReservorio !== null) {
      where.esReservorio = esReservorio === 'true';
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
