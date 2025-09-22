import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TipoAjuste } from '@prisma/client';

export async function GET() {
  try {
    const ajustes = await prisma.ajuste.findMany({
      include: {
        tarjeta: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(ajustes);
  } catch (error) {
    console.error('Error fetching ajustes:', error);
    return NextResponse.json(
      { error: 'Error fetching ajustes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { tarjetaId, tipoOperacion, valorOperacion, descripcion } = data;

    if (!tarjetaId || !tipoOperacion || !valorOperacion || !descripcion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const valor = parseFloat(valorOperacion);
    if (isNaN(valor) || valor <= 0) {
      return NextResponse.json(
        { error: 'Invalid valorOperacion' },
        { status: 400 }
      );
    }

    const tarjeta = await prisma.fuelCard.findUnique({
      where: { id: tarjetaId },
    });

    if (!tarjeta) {
      return NextResponse.json(
        { error: 'FuelCard not found' },
        { status: 404 }
      );
    }

    const nuevoSaldo =
      tipoOperacion === TipoAjuste.CREDITO
        ? (tarjeta.saldo ?? 0) + valor
        : (tarjeta.saldo ?? 0) - valor;

    const [ajuste, _] = await prisma.$transaction([
      prisma.ajuste.create({
        data: {
          tarjetaId,
          tipoOperacion,
          valorOperacion: valor,
          descripcion,
        },
      }),
      prisma.fuelCard.update({
        where: { id: tarjetaId },
        data: { saldo: nuevoSaldo },
      }),
    ]);

    return NextResponse.json(ajuste, { status: 201 });
  } catch (error) {
    console.error('Error creating ajuste:', error);
    return NextResponse.json(
      { error: 'Error creating ajuste' },
      { status: 500 }
    );
  }
}
