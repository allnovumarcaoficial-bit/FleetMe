'use server';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { tr } from 'date-fns/locale';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
export async function createDriver(id: number) {
  try {
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid driver ID' }, { status: 400 });
    }

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        vehicle: true, // Include the related vehicle
      },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error);
    return NextResponse.json(
      { error: 'Failed to fetch driver' },
      { status: 500 }
    );
  }
}

export async function getVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        driver: true,
      },
    });

    return vehicles.length;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return 0;
  }
}

export async function getTotalExpenses() {
  const startMonth = startOfMonth(new Date());
  const endMonth = endOfMonth(new Date());
  const startMonthBefore = startOfMonth(subMonths(new Date(), 1));
  const endMonthBefore = endOfMonth(subMonths(new Date(), 1));
  try {
    const operacionLThisMonth = await prisma.fuelOperation.aggregate({
      where: {
        createdAt: {
          gte: startMonth,
          lte: endMonth,
        },
      },
      _avg: {
        valorOperacionLitros: true,
      },
    });
    const saldoBeforeMonth = await prisma.fuelOperation.aggregate({
      where: {
        createdAt: {
          gte: startMonthBefore,
          lte: endMonthBefore,
        },
      },
      _avg: {
        valorOperacionLitros: true,
      },
    });
    const avgThisMonth = operacionLThisMonth._avg.valorOperacionLitros || 0;
    const avgBeforeMonth = saldoBeforeMonth._avg.valorOperacionLitros || 0;
    const growthRate = (avgThisMonth + avgBeforeMonth) / 2;
    return {
      value: avgThisMonth.toFixed(2),
      growthRate: Number(growthRate.toFixed(2)),
    };
  } catch (error) {
    console.error('Error fetching total expenses:', error);
    return {};
  }
}

export async function getTotalExpensesMoney() {
  const startMonth = startOfMonth(new Date());
  const endMonth = endOfMonth(new Date());
  const startMonthBefore = startOfMonth(subMonths(new Date(), 1));
  const endMonthBefore = endOfMonth(subMonths(new Date(), 1));
  try {
    const operacionLThisMonth = await prisma.fuelOperation.aggregate({
      where: {
        createdAt: {
          gte: startMonth,
          lte: endMonth,
        },
      },
      _avg: {
        valorOperacionDinero: true,
      },
    });
    const saldoBeforeMonth = await prisma.fuelOperation.aggregate({
      where: {
        createdAt: {
          gte: startMonthBefore,
          lte: endMonthBefore,
        },
      },
      _avg: {
        valorOperacionDinero: true,
      },
    });
    const avgThisMonth = operacionLThisMonth._avg.valorOperacionDinero || 0;
    const avgBeforeMonth = saldoBeforeMonth._avg.valorOperacionDinero || 0;
    const growthRate = (avgThisMonth + avgBeforeMonth) / 2;
    return {
      value: avgThisMonth.toFixed(2),
      growthRate: Number(growthRate.toFixed(2)),
    };
  } catch (error) {
    console.error('Error fetching total expenses:', error);
    return {};
  }
}

export async function getCarsAbastecidos() {
  const startMonth = startOfMonth(new Date());
  const endMonth = endOfMonth(new Date());

  try {
    const vehiculos = await prisma.vehicle.findMany({
      where: {
        createdAt: {
          gte: startMonth,
          lte: endMonth,
        },
        estado: 'Activo',
      },
      select: {
        marca: true,
        fuelDistributions: {
          select: {
            liters: true,
          },
        },
      },
    });
    const vehiculosAbastecidos = vehiculos.map((vehiculo) => {
      const liters = vehiculo.fuelDistributions.reduce(
        (acc, fuelDistribution) => {
          return acc + fuelDistribution.liters;
        },
        0
      );
      return {
        marca: vehiculo.marca,
        liters,
      };
    });
    const totalVehiculos = vehiculosAbastecidos.length;
    return {
      totalVehiculos,
      vehiculosAbastecidos,
    };
  } catch (error) {
    console.error('Error fetching total expenses:', error);
    return {};
  }
}
export type TypeEnum = 'marca' | 'modelo' | 'tipo_vehiculo';
export async function getVehiculesByType({ type }: { type: TypeEnum }) {
  try {
    const vehicles = await prisma.vehicle.groupBy({
      by: [type],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });
    const vehiculos = vehicles.map((vehiculo) => {
      return {
        name: vehiculo[type],
        data: vehiculo._count.id,
      };
    });
    return vehiculos;
  } catch (error) {
    console.error('Error fetching vehicules by type:', error);
    return NextResponse.json(
      { error: 'Error fetching vehicules by type' },
      { status: 500 }
    );
  }
}

export async function getChipFuel(fecha: Date) {
  const startMonth = startOfMonth(fecha);
  const endMonth = endOfMonth(fecha);
  try {
    const getchips = await prisma.fuelOperation.findMany({
      where: {
        fecha: {
          gte: startMonth,
          lte: endMonth,
        },
      },
      select: {
        id: true,
        tipoOperacion: true,
        saldoInicio: true,
        saldoFinal: true,
        valorOperacionLitros: true,
        fecha: true,
        tipoCombustible: true,
        tipoCombustible_id: true,
      },
    });
    return getchips;
  } catch (error) {
    console.error('Error fetching chip fuel:', error);
    return NextResponse.json(
      { error: 'Error fetching chip fuel' },
      { status: 500 }
    );
  }
}

export async function getKilometrosRecorridos(fecha: Date) {
  const startMonth = startOfMonth(fecha);
  const endMonth = endOfMonth(fecha);
  console.log(startMonth, endMonth);
  try {
    const getKilometros = await prisma.vehicle.findMany({
      where: {
        createdAt: {
          gte: startMonth,
          lte: endMonth,
        },
      },
      select: {
        id: true,
        matricula: true,
        createdAt: true,
        km_recorrido: true,
        odometro: true,
      },
      orderBy: {
        km_recorrido: 'asc',
      },
    });
    return getKilometros;
  } catch (error) {
    console.error('Error fetching kilometros recorridos:', error);
    return NextResponse.json(
      { error: 'Error fetching kilometros recorridos' },
      { status: 500 }
    );
  }
}
