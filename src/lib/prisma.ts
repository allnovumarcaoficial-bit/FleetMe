import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` declarations

  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Middleware para actualizar el vehículo automáticamente
prisma.$use(async (params, next) => {
  const result = await next(params); // Ejecuta la operación original (ej: updateDriver)

  // Verifica si se actualizó un conductor
  if (
    params.model === "Driver" &&
    ["update", "delete", "create"].includes(params.action)
  ) {
    const driver = result as { vehicleId: number | null };

    if (driver.vehicleId) {
      await updateVehicleStatus(driver.vehicleId); // Actualiza el vehículo
    }
  }

  return result;
});

// Función para actualizar el estado del vehículo
async function updateVehicleStatus(vehicleId: number) {
  const activeDrivers = await prisma.driver.count({
    where: {
      vehicleId,
      estado: "Activo",
    },
  });

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      estado: activeDrivers === 0 ? "Inactivo" : "Activo",
    },
  });
}

export default prisma;
