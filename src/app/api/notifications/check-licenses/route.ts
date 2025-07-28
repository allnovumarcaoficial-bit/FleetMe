import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { differenceInDays, isPast } from "date-fns";
import { notificationService } from "@/services/notification.service"; // Importar el nuevo servicio

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const drivers = await prisma.driver.findMany({
      where: {
        fecha_vencimiento_licencia: {
          lte: new Date(new Date().setDate(new Date().getDate() + 30)),
        },
      },
    });

    if (drivers.length === 0) {
      return NextResponse.json(
        { message: "No drivers found with expiring or expired licenses." },
        { status: 200 },
      );
    }

    const existingNotifications =
      await notificationService.getNotificationsByUserIdAndType(userId, [
        "warning",
        "critical",
      ]);

    const notificationsToCreateOrUpdate = [];
    const notificationsToDeleteIds: string[] = [];

    for (const driver of drivers) {
      const expirationDate = new Date(driver.fecha_vencimiento_licencia);
      const daysUntilExpiration = differenceInDays(expirationDate, new Date());
      const isExpired = isPast(expirationDate);

      const { createdOrUpdatedNotification, notificationsToDelete } =
        await notificationService.handleLicenseNotification(
          userId,
          driver.id,
          driver.nombre,
          expirationDate,
          isExpired,
          daysUntilExpiration,
          existingNotifications,
        );

      if (createdOrUpdatedNotification) {
        notificationsToCreateOrUpdate.push(createdOrUpdatedNotification);
      }
      notificationsToDeleteIds.push(...notificationsToDelete);
    }

    // Ejecutar todas las operaciones de creación, actualización y eliminación en una transacción
    // Nota: La lógica de upsert aquí es una simplificación. El servicio ya maneja la creación/actualización.
    // Una transacción más robusta se aseguraría de que todas las operaciones se completen o ninguna.
    if (notificationsToDeleteIds.length > 0) {
      await prisma.notification.deleteMany({
        where: {
          id: {
            in: notificationsToDeleteIds,
          },
        },
      });
    }

    return NextResponse.json(
      {
        message: "License check and notifications updated successfully.",
        notifications: notificationsToCreateOrUpdate,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in license check API:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
