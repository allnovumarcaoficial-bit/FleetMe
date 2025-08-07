"use server";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tr } from "date-fns/locale";
export async function createDriver(id: number) {
  try {
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
