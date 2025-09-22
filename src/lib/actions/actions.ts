'use server';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { de, id, tr } from 'date-fns/locale';
import {
  addDays,
  endOfDay,
  endOfMonth,
  formatDate,
  startOfDay,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { parse } from 'path';
import { KilometrosRecorridosData } from '@/components/Tables/kilometros-recorridos';
import { getDateByMonth } from '../utils';
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
  console.log(startMonth);
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
      _sum: {
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
      _sum: {
        valorOperacionLitros: true,
      },
    });
    const avgThisMonth = operacionLThisMonth._sum.valorOperacionLitros || 0;
    const avgBeforeMonth = saldoBeforeMonth._sum.valorOperacionLitros || 0;
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
    const operacionLThisMonth = await prisma.fuelOperation.findMany({
      where: {
        fecha: {
          gte: startMonth,
          lte: endMonth,
        },
        tipoOperacion: 'Consumo',
      },
    });
    const saldoBeforeMonth = await prisma.fuelOperation.findMany({
      where: {
        fecha: {
          gte: startMonthBefore,
          lte: endMonthBefore,
        },
        tipoOperacion: 'Consumo',
      },
    });
    const avgThisMonth = operacionLThisMonth.reduce((acc, curr) => {
      return acc + (curr.valorOperacionDinero || 0);
    }, 0);
    const avgBeforeMonth = saldoBeforeMonth.reduce((acc, curr) => {
      return acc + (curr.valorOperacionDinero || 0);
    }, 0);
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
export type TypeEnum = 'Administrativo' | 'Logistico' | 'EntregaDePedidos';
export async function getVehiculesByType({ type }: { type: TypeEnum }) {
  try {
    const vehicules = await prisma.servicio.findMany({
      where: {
        tipoServicio: type,
      },
      select: {
        vehicle: {
          select: {
            id: true,
            matricula: true,
            marca: true,
            modelo: true,
          },
        },
      },
    });
    const vehicleCounts = vehicules.reduce((acc: any, item) => {
      const vehicleId = item.vehicle?.id || 0;
      acc[vehicleId] = (acc[vehicleId] || 0) + 1;
      return acc;
    }, {});

    const result = vehicules
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.vehicle?.id === item.vehicle?.id)
      )
      .map((item) => ({
        name: item.vehicle?.marca,
        data: vehicleCounts[item.vehicle?.id || 0] as number,
      }));
    return result;
  } catch (error) {
    console.error('Error fetching vehicules by type:', error);
    return NextResponse.json(
      { error: 'Error fetching vehicules by type' },
      { status: 500 }
    );
  }
}

export async function getChipFuel(fecha: Date, fuelCardId: string) {
  const startMonth = startOfMonth(fecha);
  const endMonth = endOfMonth(fecha);
  try {
    const getchips = await prisma.fuelOperation.findMany({
      where: {
        fecha: {
          gte: startMonth,
          lte: endMonth,
        },
        fuelCard: {
          id: parseInt(fuelCardId),
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
        descripcion: true,
        operationReservorio: {
          select: {
            reservorio: {
              select: {
                nombre: true,
              },
            },
            litros: true,
          },
        },
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

export async function getChipFuelTotal(fecha: Date) {
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
        descripcion: true,
        operationReservorio: {
          select: {
            reservorio: {
              select: {
                nombre: true,
              },
            },
            litros: true,
          },
        },
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
  try {
    const getKilometros = await prisma.servicio.findMany({
      where: {
        fecha: {
          gte: startMonth,
          lte: endMonth,
        },
      },
      select: {
        id: true,
        fecha: true,
        kilometrosRecorridos: true,
        vehicle: {
          select: {
            id: true,
            matricula: true,
            odometro: true,
            odometro_inicial: true,
            modelo: true,
            mantenimientos: {
              where: {
                fecha: {
                  gte: startMonth,
                  lte: endMonth,
                },
              },
            },
            fuelDistributions: true,
          },
        },
      },
      orderBy: {
        kilometrosRecorridos: 'asc',
      },
    });

    const kilometros = getKilometros.map((item) => ({
      id: item.vehicle?.id || 0,
      matricula: `${item.vehicle?.modelo || 'Sin modelo'}(${item.vehicle?.matricula || 'Sin matrícula'})`,
      createdAt: item.fecha,
      kilometrosRecorridos: item.kilometrosRecorridos || 0,
      odometro: item.vehicle?.odometro || 0,
      odometroInicial: item.vehicle?.odometro_inicial || 0,
      gasto_mantenimientos: item.vehicle?.mantenimientos.reduce(
        (acc, curr) => acc + (curr.costo || 0),
        0
      ),
      liters: item.vehicle?.fuelDistributions.reduce(
        (acc, curr) => acc + (curr.liters || 0),
        0
      ),
    }));
    const resultado = kilometros.reduce(
      (acumulador, actual) => {
        const matricula = actual.matricula;

        if (!acumulador[matricula]) {
          acumulador[matricula] = {
            id: actual.id,
            createdAt: actual.createdAt,
            matricula: matricula,
            kilometrosRecorridos: 0,
            odometro: Math.max(actual.odometro, 0),
            odometroInicial: actual.odometroInicial,
            gasto_mantenimientos: actual.gasto_mantenimientos,
            liters: actual.liters,
          };
        }

        acumulador[matricula].kilometrosRecorridos =
          (acumulador[matricula]?.kilometrosRecorridos || 0) +
          (actual.kilometrosRecorridos || 0);

        return acumulador;
      },
      {} as Record<string, KilometrosRecorridosData>
    );

    // Convertir a array
    const resultadoArray = Object.values(resultado);
    const vehicles = await prisma.vehicle.findMany({
      include: {
        mantenimientos: true,
        fuelDistributions: true,
      },
    });
    const idsEnResultado = new Set(resultadoArray.map((item) => item.id));
    const vehiclesFormated = vehicles
      .filter((veh) => !idsEnResultado.has(veh.id))
      .map((veh) => ({
        id: veh.id,
        createdAt: veh.createdAt,
        matricula: `${veh.modelo}(${veh.matricula})`,
        kilometrosRecorridos: 0,
        odometro: Math.max(veh.odometro || 0, 0),
        odometroInicial: veh.odometro_inicial || 0,
        gasto_mantenimientos: veh.mantenimientos.reduce(
          (acc, curr) => acc + (curr.costo || 0),
          0
        ),
        liters: veh.fuelDistributions.reduce(
          (acc, curr) => acc + (curr.liters || 0),
          0
        ),
      }));
    const result = [...vehiclesFormated, resultadoArray].flat();

    return result;
  } catch (error) {
    console.error('Error fetching kilometros recorridos:', error);
    return NextResponse.json(
      { error: 'Error fetching kilometros recorridos' },
      { status: 500 }
    );
  }
}

export async function getKilometrosRecorridosChart(params: { fecha: Date }) {
  const { fecha } = params;
  const startMonth = startOfMonth(fecha);
  const endMonth = endOfMonth(fecha);
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
    const result = getKilometros.map((item) => ({
      x: formatDate(item.createdAt, 'dd/MM/yyyy'),
      y: item.km_recorrido,
    }));
    return {
      kilometros: result,
    };
  } catch (error) {
    console.error('Error fetching kilometros recorridos:', error);
    throw new Error('Error fetching kilometros recorridos');
  }
}

export async function getGastosMantenimiento_Combustible(params: {
  fecha: Date;
}) {
  const startMonth = startOfMonth(params.fecha);
  const endMonth = endOfMonth(params.fecha);
  try {
    const operations = await prisma.vehicle.findMany({
      select: {
        id: true,
        matricula: true,
        marca: true,
        mantenimientos: {
          select: {
            costo: true,
          },
          where: {
            // Filtros opcionales para mantenimientos
            fecha: {
              gte: startMonth,
              lte: endMonth,
            },
          },
        },
        fuelDistributions: {
          select: {
            fuelOperation: {
              select: {
                valorOperacionDinero: true,
              },
            },
          },

          where: {
            // Filtros opcionales para operaciones de combustible
            fuelOperation: {
              fecha: {
                gte: startMonth,
                lte: endMonth,
              },
            },
          },
        },
      },
    });
    // Procesar los datos
    const resultado = operations.map((vehicle) => {
      const totalMantenimientos = vehicle.mantenimientos.reduce(
        (sum, mantenimiento) => sum + mantenimiento.costo,
        0
      );

      const totalCombustible = vehicle.fuelDistributions.reduce(
        (sum, distribution) =>
          sum + (distribution.fuelOperation?.valorOperacionDinero || 0),
        0
      );

      return {
        vehicleId: vehicle.id,
        matricula: `${vehicle.marca}`,
        totalMantenimientos,
        totalCombustible,
      };
    });

    return resultado;
  } catch (error) {
    console.error(
      'Error fetching Gastos de mantenimiento y combustible:',
      error
    );
    throw new Error('Error fetching Gastos de mantenimiento y combustible');
  }
}

export async function getMantenimientosTable(fecha: Date) {
  const startMonth = startOfMonth(fecha);
  const endMonth = endOfMonth(fecha);
  try {
    const mantenimientos = await prisma.mantenimiento.findMany({
      where: {
        fecha: {
          gte: startMonth,
          lte: endMonth,
        },
      },
      select: {
        id: true,
        vehicle: {
          select: {
            matricula: true,
            odometro: true,
            km_recorrido: true,
          },
        },
        fecha: true,
        costo: true,
        descripcion: true,
        cambio_de_pieza: true,
        tipo: true,
        estado: true,
        lista_de_piezas: true,
        numero_serie_anterior: true,
        numero_serie_nueva: true,
      },
    });
    return mantenimientos;
  } catch (error) {
    console.error('Error fetching reporte de mantenimientos:', error);
    throw new Error('Error fetching reporte de mantenimientos');
  }
}

export async function getMantenimientoTotal(fecha: Date) {
  const startMonth = startOfMonth(fecha);
  const endMonth = endOfMonth(fecha);
  try {
    const mantenimientos = await prisma.mantenimiento.aggregate({
      where: {
        fecha: {
          gte: startMonth,
          lte: endMonth,
        },
      },
      _sum: {
        costo: true,
      },
    });
    return mantenimientos._sum.costo || 0;
  } catch (error) {
    console.error('Error fetching reporte de mantenimientos:', error);
    throw new Error('Error fetching reporte de mantenimientos');
  }
}

export async function getGastoCombustible_Total(
  fecha: Date,
  fuelCardId: string,
  periodo: string
) {
  let startMonth = new Date();
  let endMonth = new Date();
  if (periodo === 'Mensual') {
    startMonth = startOfMonth(fecha);
    endMonth = endOfMonth(fecha);
  } else {
    startMonth = startOfDay(fecha);
    endMonth = endOfDay(fecha);
  }
  try {
    const combustible = await prisma.fuelOperation.aggregate({
      where: {
        fecha: {
          gte: startMonth,
          lte: endMonth,
        },
        fuelCard: {
          numeroDeTarjeta: fuelCardId,
        },
        tipoOperacion: 'Consumo',
      },
      _sum: {
        valorOperacionDinero: true,
      },
    });
    return combustible._sum.valorOperacionDinero || 0;
  } catch (error) {
    console.error('Error fetching reporte de combustible:', error);
    throw new Error('Error fetching reporte de combustible');
  }
}

export async function getSaldoCombustible_Total(
  fecha: Date,
  fuelCardId: string,
  periodo: string
) {
  let startMonth = new Date();
  let endMonth = new Date();
  if (periodo === 'Mensual') {
    startMonth = startOfMonth(fecha);
    endMonth = endOfMonth(fecha);
  } else {
    startMonth = startOfDay(fecha);
    endMonth = endOfDay(fecha);
  }
  try {
    const combustible = await prisma.fuelOperation.aggregate({
      where: {
        fecha: {
          gte: startMonth,
          lte: endMonth,
        },
        fuelCard: {
          numeroDeTarjeta: fuelCardId,
        },
        tipoOperacion: 'Carga',
      },
      _sum: {
        saldoFinal: true,
      },
    });
    return combustible._sum.saldoFinal || 0;
  } catch (error) {
    console.error('Error fetching reporte de combustible:', error);
    throw new Error('Error fetching reporte de combustible');
  }
}

export async function getReporteGastos({
  fuelCardId,
  periodo,
  mes,
}: {
  fuelCardId: string;
  periodo: string;
  mes: string;
}) {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  try {
    const mantenimientosGastos = [];
    const combustibleGastos = [];
    if (periodo === 'Mensual') {
      for (let i = 0; i < 12; i++) {
        const fecha = new Date();
        fecha.setMonth(i);
        const combustible = await getGastoCombustible_Total(
          fecha,
          fuelCardId,
          periodo
        );
        const mantenimiento = await getSaldoCombustible_Total(
          fecha,
          fuelCardId,
          periodo
        );
        mantenimientosGastos.push({
          x: months[i].toUpperCase().slice(0, 3),
          y: mantenimiento,
        });
        combustibleGastos.push({
          x: months[i].toUpperCase().slice(0, 3),
          y: combustible,
        });
      }
    } else {
      const fecha = getDateByMonth(mes);
      let startMonth = startOfMonth(fecha);
      const endMonth = endOfMonth(fecha);
      while (startMonth <= endMonth) {
        const combustible = await getGastoCombustible_Total(
          startMonth,
          fuelCardId,
          periodo
        );
        const mantenimiento = await getSaldoCombustible_Total(
          startMonth,
          fuelCardId,
          periodo
        );
        mantenimientosGastos.push({
          x: formatDate(startMonth.toISOString(), 'dd/MM/yyyy'),
          y: mantenimiento,
        });
        combustibleGastos.push({
          x: formatDate(startMonth.toISOString(), 'dd/MM/yyyy'),
          y: combustible,
        });
        startMonth = addDays(startMonth, 1);
      }
    }

    return {
      mantenimientosGastos,
      combustibleGastos,
    };
  } catch (error) {
    console.error('Error fetching reporte de gastos:', error);
    throw new Error('Error fetching reporte de gastos');
  }
}

export async function getEventsCalendar() {
  try {
    const mantenimiento = await prisma.mantenimiento.findMany({
      select: {
        fecha: true,
        descripcion: true,
        id: true,
        vehicle: {
          select: {
            matricula: true,
          },
        },
      },
    });
    const vehiculos = await prisma.vehicle.findMany({
      select: {
        id: true,
        matricula: true,
        fecha_vencimiento_circulacion: true,
        fecha_vencimiento_licencia_operativa: true,
        fecha_vencimiento_somaton: true,
      },
    });
    const drivers = await prisma.driver.findMany({
      select: {
        id: true,
        nombre: true,
        licencia: true,
        fecha_vencimiento_licencia: true,
      },
    });
    const fuelCard = await prisma.fuelCard.findMany({
      select: {
        id: true,
        numeroDeTarjeta: true,
        fechaVencimiento: true,
      },
    });
    const events: CalendarEvent[] = mantenimiento.map((item) => ({
      id: item.id.toString(),
      title: `Mantenimiento a ${item.vehicle?.matricula}`,
      startDate: item.fecha,
      endDate: item.fecha,
      color: '#619885',
      description: item.descripcion || '',
    }));
    events.push(
      ...vehiculos.map((item) => ({
        id: item.id.toString(),
        title: item.fecha_vencimiento_circulacion
          ? `Vencimiento de la circulación del vehículo ${item.matricula}`
          : `Vencimiento de la circulación del vehículo ${item.matricula}`,
        startDate: item.fecha_vencimiento_circulacion || new Date(),
        endDate: item.fecha_vencimiento_circulacion || new Date(),
        color: '#e32f21',
      }))
    );
    events.push(
      ...vehiculos.map((item) => ({
        id: item.id.toString(),
        title: item.fecha_vencimiento_licencia_operativa
          ? `Vencimiento de la licencia operativa del vehículo ${item.matricula}`
          : `No hay licencia operativa del vehículo ${item.matricula}`,
        startDate: item.fecha_vencimiento_licencia_operativa || new Date(),
        endDate: item.fecha_vencimiento_licencia_operativa || new Date(),
        color: '#e32f21',
      }))
    );
    events.push(
      ...vehiculos.map((item) => ({
        id: item.id.toString(),
        title: item.fecha_vencimiento_somaton
          ? `Vencimiento del somatón del vehículo ${item.matricula}`
          : `No hay somaton del vehículo ${item.matricula}`,
        startDate: item.fecha_vencimiento_somaton || new Date(),
        endDate: item.fecha_vencimiento_somaton || new Date(),
        color: '#e32f21',
      }))
    );
    events.push(
      ...fuelCard.map((item) => ({
        id: item.id.toString(),
        title: `Vencimiento de la tarjeta ${item.numeroDeTarjeta}`,
        startDate: item.fechaVencimiento,
        endDate: item.fechaVencimiento,
        color: '#e32f21',
      }))
    );
    events.push(
      ...drivers.map((item) => ({
        id: item.id.toString(),
        title: `Vencimiento de la licencia del conductor ${item.licencia}`,
        startDate: item.fecha_vencimiento_licencia,
        endDate: item.fecha_vencimiento_licencia,
        color: '#e32f21',
        description: item.nombre || '',
      }))
    );
    events.push(
      ...fuelCard.map((item) => ({
        id: item.id.toString(),
        title: `Vencimiento de la tarjeta ${item.numeroDeTarjeta}`,
        startDate: item.fechaVencimiento,
        endDate: item.fechaVencimiento,
        color: '#e32f21',
      }))
    );

    return events;
  } catch (error) {
    console.error('Error fetching events calendar:', error);
    throw new Error('Error fetching events calendar');
  }
}

export async function getIndiceConsumo(vehicleId: string, fecha: Date) {
  try {
    const result = [];
    const startMonth = startOfMonth(fecha);
    const endMonth = endOfMonth(fecha);
    const vehicule = await prisma.vehicle.findFirst({
      where: {
        matricula: vehicleId,
      },
    });
    const operaciones = await prisma.fuelDistribution.findMany({
      where: {
        vehicleId: vehicule?.id,
        fuelOperation: {
          fecha: {
            gte: startMonth,
            lte: endMonth,
          },
          tipoOperacion: 'Consumo',
        },
      },
      include: {
        fuelOperation: true,
        vehicle: true, // Para tener acceso a la fecha
      },
    });

    for (let i = 1; i < operaciones.length; i++) {
      const kilometrosRecorridos = operaciones[i].odometro_Vehicle || 0;
      const kilometroOperacionAnterior =
        operaciones[i - 1].odometro_Vehicle || 0;
      const liters = operaciones[i - 1].liters || 0;
      if (kilometrosRecorridos > 0) {
        const indiceConsumo =
          liters > 0
            ? (kilometrosRecorridos - kilometroOperacionAnterior) / liters
            : 0;

        result.push({
          fecha: operaciones[i].fuelOperation?.fecha,
          indiceConsumo: parseFloat(indiceConsumo.toFixed(2)),
          auto: operaciones[i].vehicle?.matricula || '',
        });
      }
    }

    const avgConsumo =
      result.reduce((acc, curr) => acc + curr.indiceConsumo, 0) /
        result.length || 0;

    return {
      promedioConsumo: avgConsumo,
      data: result,
    };
  } catch (error) {
    console.error('Error fetching indice de consumo:', error);
    throw new Error('Error fetching indice de consumo');
  }
}

export async function getAllVehiculos() {
  try {
    const vehiculos = await prisma.vehicle.findMany({
      select: {
        id: true,
        matricula: true,
        marca: true,
        modelo: true,
      },
      orderBy: {
        matricula: 'asc',
      },
    });
    return vehiculos;
  } catch (error) {
    console.error('Error fetching vehiculos:', error);
    return [];
  }
}

export async function getAllDrivers() {
  try {
    const drivers = await prisma.driver.findMany({
      select: {
        id: true,
        nombre: true,
        licencia: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
    return drivers;
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
}

export async function getFuelCardData() {
  try {
    const fueldCard = await prisma.fuelCard.findMany();
    return fueldCard;
  } catch (error) {
    console.error('Error fetching fuel card data:', error);
    return [];
  }
}
