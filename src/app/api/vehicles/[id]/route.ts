import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid vehicle ID" },
        { status: 400 },
      );
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        driver: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid vehicle ID" },
        { status: 400 },
      );
    }

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

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
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
        driver: driverId ? { connect: { id: driverId } } : { disconnect: true },
        destino, // Nuevo campo
      },
    });

    return NextResponse.json(updatedVehicle);
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "VIN o Matrícula ya existen." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update vehicle", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid vehicle ID" },
        { status: 400 },
      );
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Vehicle deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting vehicle:", error);
    if (error.code === "P2025") {
      // Record to delete does not exist
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete vehicle", details: error.message },
      { status: 500 },
    );
  }
}
