import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { canUpdateDriverStatus } from "@/services/driver.service";
export async function GET(request: Request, context: any) {
  try {
    const { id: paramId } = await context.params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid driver ID" }, { status: 400 });
    }

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        vehicle: true, // Include the related vehicle
      },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error("Error fetching driver:", error);
    return NextResponse.json(
      { error: "Failed to fetch driver" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: any) {
  try {
    const { id: paramId } = await context.params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid driver ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      nombre,
      licencia,
      fecha_vencimiento_licencia,
      carnet_peritage,
      estado, // Add estado field
      vehicleId, // Optional: for connecting/disconnecting a vehicle
    } = body;
    if (estado) {
      const validation = await canUpdateDriverStatus(id, estado);
      if (!validation.canUpdate) {
        return NextResponse.json(
          { error: validation.message },
          { status: 400 },
        );
      }
    }
    const parsedFechaVencimientoLicencia = new Date(fecha_vencimiento_licencia);

    // Handle vehicle relationship updates
    let vehicleUpdateData: any = {};
    if (vehicleId === null) {
      // Disconnect from any existing vehicle
      vehicleUpdateData = { disconnect: true };
    } else if (vehicleId !== undefined) {
      // Connect to a new vehicle, or update existing connection
      const existingVehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: { driver: true },
      });

      if (
        existingVehicle &&
        existingVehicle.driver &&
        existingVehicle.driver.id !== id
      ) {
        return NextResponse.json(
          { error: "El vehículo seleccionado ya tiene un conductor asignado." },
          { status: 409 },
        );
      }
      vehicleUpdateData = { connect: { id: vehicleId } };
    }

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        nombre,
        licencia,
        fecha_vencimiento_licencia: parsedFechaVencimientoLicencia,
        carnet_peritage,
        estado, // Add estado to the update data
        ...(vehicleId !== undefined && { vehicle: vehicleUpdateData }),
      },
      include: {
        vehicle: true,
      },
    });

    return NextResponse.json(updatedDriver);
  } catch (error: any) {
    console.error("Error updating driver:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Licencia ya existe." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update driver", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const { id: paramId } = await context.params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid driver ID" }, { status: 400 });
    }

    // Before deleting the driver, disconnect them from any associated vehicle
    await prisma.vehicle.updateMany({
      where: { driverId: id },
      data: { driverId: null },
    });

    await prisma.driver.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Driver deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting driver:", error);
    if (error.code === "P2025") {
      // Record to delete does not exist
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete driver", details: error.message },
      { status: 500 },
    );
  }
}
