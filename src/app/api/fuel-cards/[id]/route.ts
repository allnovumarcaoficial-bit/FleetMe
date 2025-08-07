import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: "Invalid fuel card ID" },
        { status: 400 },
      );
    }

    const fuelCard = await prisma.fuelCard.findUnique({
      where: { id: idNum },
    });

    if (!fuelCard) {
      return NextResponse.json(
        { error: "Fuel card not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(fuelCard);
  } catch (error) {
    console.error("Error fetching fuel card:", error);
    return NextResponse.json(
      { error: "Failed to fetch fuel card" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid fuel card ID" },
        { status: 400 },
      );
    }

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

    const updatedFuelCard = await prisma.fuelCard.update({
      where: { id },
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

    return NextResponse.json(updatedFuelCard);
  } catch (error: any) {
    console.error("Error updating fuel card:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Número de Tarjeta ya existe." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update fuel card", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid fuel card ID" },
        { status: 400 },
      );
    }

    await prisma.fuelCard.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Fuel card deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting fuel card:", error);
    if (error.code === "P2025") {
      // Record to delete does not exist
      return NextResponse.json(
        { error: "Fuel card not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to delete fuel card", details: error.message },
      { status: 500 },
    );
  }
}
