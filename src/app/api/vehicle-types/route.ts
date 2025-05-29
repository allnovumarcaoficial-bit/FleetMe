import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const vehicleTypes = await prisma.vehicleType.findMany();
    return NextResponse.json({ data: vehicleTypes });
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle types' }, { status: 500 });
  }
}
