import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    const service = await prisma.servicio.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            id: true,
            matricula: true,
            marca: true,
            modelo: true,
          },
        },
        driver: {
          select: {
            id: true,
            nombre: true,
            licencia: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      tipoServicio,
      fecha,
      odometroInicial,
      odometroFinal,
      cantidadPedidos,
      origen,
      destino,
      descripcion,
      kilometrosRecorridos,
      estado,
      vehicleId,
      driver_id,
    } = body;
    const parsedFecha = new Date(fecha);

    const updatedServicio = await prisma.servicio.update({
      where: { id },
      data: {
        tipoServicio,
        fecha: parsedFecha,
        odometroInicial: parseInt(odometroInicial),
        odometroFinal: odometroFinal ? parseInt(odometroFinal) : null,
        cantidadPedidos: cantidadPedidos ? parseInt(cantidadPedidos) : null,
        origen,
        destino,
        descripcion,
        kilometrosRecorridos: parseInt(kilometrosRecorridos),
        estado,
        driver: {
          connect: { id: driver_id },
        },
        vehicle: {
          connect: { id: parseInt(vehicleId) },
        },
      },
    });
    if (updatedServicio.odometroFinal !== 0) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: parseInt(vehicleId) },
        select: {
          km_recorrido: true,
        },
      });
      await prisma.vehicle.update({
        where: { id: parseInt(vehicleId) },
        data: {
          odometro: updatedServicio.odometroFinal,
          km_recorrido:
            (updatedServicio.kilometrosRecorridos || 0) +
              (vehicle?.km_recorrido || 0) || 0,
        },
      });
    }

    return NextResponse.json(updatedServicio);
  } catch (error: any) {
    console.error('Error creating service:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { error: 'Failed to update service', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    await prisma.servicio.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Service deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting service:', error);
    if (error.code === 'P2025') {
      // Record to delete does not exist
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete service', details: error.message },
      { status: 500 }
    );
  }
}
