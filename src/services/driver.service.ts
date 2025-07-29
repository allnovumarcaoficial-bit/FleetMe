import prisma from "@/lib/prisma";
import { isPast } from "date-fns";

/**
 * Checks if a driver's status can be updated.
 * @param driverId The ID of the driver.
 * @param newStatus The new status to be applied.
 * @returns An object indicating if the update is allowed and a message.
 */
export async function canUpdateDriverStatus(
  driverId: number,
  newStatus: string,
): Promise<{ canUpdate: boolean; message?: string }> {
  if (newStatus !== "Activo") {
    return { canUpdate: true };
  }

  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
  });

  if (!driver) {
    return { canUpdate: false, message: "Conductor no encontrado." };
  }

  const licenseIsExpired = isPast(new Date(driver.fecha_vencimiento_licencia));

  if (licenseIsExpired) {
    return {
      canUpdate: false,
      message: "La licencia del conductor está vencida. No se puede activar.",
    };
  }

  return { canUpdate: true };
}
