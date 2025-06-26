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
    const marca = searchParams.get('marca') || '';
    const modelo = searchParams.get('modelo') || '';
    const vin = searchParams.get('vin') || '';
    const matricula = searchParams.get('matricula') || '';
    const estado = searchParams.get('estado') || '';
    const fechaCompraDesde = searchParams.get('fechaCompraDesde');
    const fechaCompraHasta = searchParams.get('fechaCompraHasta');
    const fechaVencimientoLicenciaOperativaDesde = searchParams.get('fechaVencimientoLicenciaOperativaDesde');
    const fechaVencimientoLicenciaOperativaHasta = searchParams.get('fechaVencimientoLicenciaOperativaHasta');
    const fechaVencimientoCirculacionDesde = searchParams.get('fechaVencimientoCirculacionDesde');
    const fechaVencimientoCirculacionHasta = searchParams.get('fechaVencimientoCirculacionHasta');
    const fechaVencimientoSomatonDesde = searchParams.get('fechaVencimientoSomatonDesde');
    const fechaVencimientoSomatonHasta = searchParams.get('fechaVencimientoSomatonHasta');
    const gps = searchParams.get('gps'); // 'true' or 'false' string
    const tipoNombre = searchParams.get('tipoNombre') || '';
    const driverSearch = searchParams.get('driver') || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    // Global search
    if (search) {
      where.OR = [
        { marca: { contains: search } },
        { modelo: { contains: search } },
        { vin: { contains: search } },
        { matricula: { contains: search } },
        { tipoNombre: { contains: search } },
        { driver: { nombre: { contains: search } } },
      ];
    }

    // Column filters
    if (marca) {
      where.marca = { contains: marca };
    }
    if (modelo) {
      where.modelo = { contains: modelo };
    }
    if (vin) {
      where.vin = { contains: vin };
    }
    if (matricula) {
      where.matricula = { contains: matricula };
    }
    if (estado) {
      where.estado = estado;
    }
    if (fechaCompraDesde && fechaCompraHasta) {
      where.fecha_compra = {
        gte: new Date(fechaCompraDesde),
        lte: new Date(fechaCompraHasta),
      };
    }
    if (fechaVencimientoLicenciaOperativaDesde && fechaVencimientoLicenciaOperativaHasta) {
      where.fecha_vencimiento_licencia_operativa = {
        gte: new Date(fechaVencimientoLicenciaOperativaDesde),
        lte: new Date(fechaVencimientoLicenciaOperativaHasta),
      };
    }
    if (fechaVencimientoCirculacionDesde && fechaVencimientoCirculacionHasta) {
      where.fecha_vencimiento_circulacion = {
        gte: new Date(fechaVencimientoCirculacionDesde),
        lte: new Date(fechaVencimientoCirculacionHasta),
      };
    }
    if (fechaVencimientoSomatonDesde && fechaVencimientoSomatonHasta) {
      where.fecha_vencimiento_somaton = {
        gte: new Date(fechaVencimientoSomatonDesde),
        lte: new Date(fechaVencimientoSomatonHasta),
      };
    }
    if (gps !== null) {
      where.gps = gps === 'true';
    }
    if (tipoNombre) {
      where.tipoNombre = { contains: tipoNombre };
    }
    if (driverSearch) {
      where.driver = {
        nombre: { contains: driverSearch },
      };
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
      // listado_idconductores, // Removed as it's not a direct field in VehicleCreateInput
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
