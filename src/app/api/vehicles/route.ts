import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "asc"; // 'asc' or 'desc'
    const search = searchParams.get("search") || "";
    const marca = searchParams.get("marca") || "";
    const modelo = searchParams.get("modelo") || "";
    const vin = searchParams.get("vin") || "";
    const matricula = searchParams.get("matricula") || "";
    const estado = searchParams.get("estado") || "";
    const fechaCompraDesde = searchParams.get("fechaCompraDesde");
    const fechaCompraHasta = searchParams.get("fechaCompraHasta");
    const fechaVencimientoLicenciaOperativaDesde = searchParams.get(
      "fechaVencimientoLicenciaOperativaDesde",
    );
    const fechaVencimientoLicenciaOperativaHasta = searchParams.get(
      "fechaVencimientoLicenciaOperativaHasta",
    );
    const fechaVencimientoCirculacionDesde = searchParams.get(
      "fechaVencimientoCirculacionDesde",
    );
    const fechaVencimientoCirculacionHasta = searchParams.get(
      "fechaVencimientoCirculacionHasta",
    );
    const fechaVencimientoSomatonDesde = searchParams.get(
      "fechaVencimientoSomatonDesde",
    );
    const fechaVencimientoSomatonHasta = searchParams.get(
      "fechaVencimientoSomatonHasta",
    );
    const gps = searchParams.get("gps"); // 'true' or 'false' string
    const tipo_vehiculo = searchParams.get("tipo_vehiculo") || "";
    const driverSearch = searchParams.get("driver") || "";

    const skip = (page - 1) * limit;

    const where: any = {};

    // Global search
    if (search) {
      where.OR = [
        { marca: { contains: search } },
        { modelo: { contains: search } },
        { vin: { contains: search } },
        { matricula: { contains: search } },
        { tipo_vehiculo: { contains: search } },
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
    if (
      fechaVencimientoLicenciaOperativaDesde &&
      fechaVencimientoLicenciaOperativaHasta
    ) {
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
    if (gps !== null && gps !== undefined) {
      where.gps = gps === "true";
    }
    if (tipo_vehiculo) {
      where.tipo_vehiculo = { contains: tipo_vehiculo };
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
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
      listado_municipios,
      tipo_vehiculo,
      cantidad_neumaticos,
      tipo_neumaticos,
      capacidad_carga,
      cantidad_conductores,
      ciclo_mantenimiento_km,
      es_electrico,
      cantidad_baterias,
      tipo_bateria,
      amperage,
      voltage,
      tipo_combustible,
      capacidad_tanque,
      indice_consumo,
      driverId,
      destino, // Nuevo campo
    } = body;

    // Validate required date fields
    if (!fecha_compra) {
      return NextResponse.json(
        { error: "Fecha de compra es requerida." },
        { status: 400 },
      );
    }
    if (!fecha_vencimiento_licencia_operativa) {
      return NextResponse.json(
        { error: "Fecha de vencimiento de licencia operativa es requerida." },
        { status: 400 },
      );
    }
    if (!fecha_vencimiento_circulacion) {
      return NextResponse.json(
        { error: "Fecha de vencimiento de circulación es requerida." },
        { status: 400 },
      );
    }
    if (!fecha_vencimiento_somaton) {
      return NextResponse.json(
        { error: "Fecha de vencimiento de somatón es requerida." },
        { status: 400 },
      );
    }

    // Convert date strings to Date objects
    const parsedFechaCompra = new Date(fecha_compra);
    const parsedFechaVencimientoLicenciaOperativa = new Date(
      fecha_vencimiento_licencia_operativa,
    );
    const parsedFechaVencimientoCirculacion = new Date(
      fecha_vencimiento_circulacion,
    );
    const parsedFechaVencimientoSomaton = new Date(fecha_vencimiento_somaton);

    // Check for invalid dates after parsing
    if (isNaN(parsedFechaCompra.getTime())) {
      return NextResponse.json(
        { error: "Fecha de compra inválida." },
        { status: 400 },
      );
    }
    if (isNaN(parsedFechaVencimientoLicenciaOperativa.getTime())) {
      return NextResponse.json(
        { error: "Fecha de vencimiento de licencia operativa inválida." },
        { status: 400 },
      );
    }
    if (isNaN(parsedFechaVencimientoCirculacion.getTime())) {
      return NextResponse.json(
        { error: "Fecha de vencimiento de circulación inválida." },
        { status: 400 },
      );
    }
    if (isNaN(parsedFechaVencimientoSomaton.getTime())) {
      return NextResponse.json(
        { error: "Fecha de vencimiento de somatón inválida." },
        { status: 400 },
      );
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        marca,
        modelo,
        vin,
        matricula,
        fecha_compra: parsedFechaCompra,
        fecha_vencimiento_licencia_operativa:
          parsedFechaVencimientoLicenciaOperativa,
        fecha_vencimiento_circulacion: parsedFechaVencimientoCirculacion,
        fecha_vencimiento_somaton: parsedFechaVencimientoSomaton,
        estado,
        gps,
        listado_municipios,
        tipo_vehiculo,
        cantidad_neumaticos,
        tipo_neumaticos,
        capacidad_carga,
        cantidad_conductores,
        ciclo_mantenimiento_km,
        es_electrico,
        cantidad_baterias,
        tipo_bateria,
        amperage,
        voltage,
        tipo_combustible,
        capacidad_tanque,
        indice_consumo,
        driver: driverId ? { connect: { id: driverId } } : undefined,
        destino, // Nuevo campo
      },
    });

    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error: any) {
    console.error("Error creating vehicle:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "VIN o Matrícula ya existen." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create vehicle", details: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  return NextResponse.json(
    { message: "PUT not implemented yet" },
    { status: 501 },
  );
}

export async function DELETE(request: Request) {
  return NextResponse.json(
    { message: "DELETE not implemented yet" },
    { status: 501 },
  );
}
