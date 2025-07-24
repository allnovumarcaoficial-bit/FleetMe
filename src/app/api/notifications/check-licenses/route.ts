import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { differenceInDays, isPast } from "date-fns";
import { NotificationType } from "@/types/notification";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Obtener conductores con licencias vencidas o próximas a vencer (en los próximos 30 días)
    const drivers = await prisma.driver.findMany({
      where: {
        fecha_vencimiento_licencia: {
          lte: new Date(new Date().setDate(new Date().getDate() + 30)), // Licencias que vencen en 30 días o menos
        },
      },
    });

    if (drivers.length === 0) {
      return NextResponse.json(
        { message: "No drivers found with expiring or expired licenses." },
        { status: 200 },
      );
    }

    // Obtener todas las notificaciones existentes para el usuario actual
    const existingNotifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        type: {
          in: ["warning", "critical"],
        },
      },
    });

    const notificationsToCreate = [];
    const notificationsToUpdate = [];

    for (const driver of drivers) {
      const expirationDate = new Date(driver.fecha_vencimiento_licencia);
      const daysUntilExpiration = differenceInDays(expirationDate, new Date());

      const link = `/fleet/drivers/${driver.id}`;

      const existingWarningNotif = existingNotifications.find(
        (n) => n.link === link && n.type === "warning",
      );
      const existingCriticalNotif = existingNotifications.find(
        (n) => n.link === link && n.type === "critical",
      );

      if (isPast(expirationDate)) {
        // Licencia vencida: Notificación crítica
        if (!existingCriticalNotif) {
          notificationsToCreate.push({
            userId: userId,
            type: "critical" as NotificationType,
            message: `Licencia Vencida: ${driver.nombre}`,
            details: `La licencia de conducción del conductor ${driver.nombre} ha vencido.`,
            link: link,
            read: false,
          });
        } else {
          notificationsToUpdate.push({
            id: existingCriticalNotif.id,
            data: {
              message: `Licencia Vencida: ${driver.nombre}`,
              details: `La licencia de conducción del conductor ${driver.nombre} ha vencido.`,
              read: false, // Marcar como no leída si ya existía
            },
          });
        }
        // Si existe una advertencia para la misma licencia, eliminarla
        if (existingWarningNotif) {
          await prisma.notification.delete({
            where: { id: existingWarningNotif.id },
          });
        }
      } else if (daysUntilExpiration <= 30 && daysUntilExpiration >= 0) {
        // Licencia próxima a vencer: Notificación de advertencia
        if (!existingWarningNotif) {
          notificationsToCreate.push({
            userId: userId,
            type: "warning" as NotificationType,
            message: `Licencia Próxima a Vencer: ${driver.nombre}`,
            details: `La licencia del conductor ${driver.nombre} vencerá en ${daysUntilExpiration} días.`,
            link: link,
            read: false,
          });
        } else {
          notificationsToUpdate.push({
            id: existingWarningNotif.id,
            data: {
              message: `Licencia Próxima a Vencer: ${driver.nombre}`,
              details: `La licencia del conductor ${driver.nombre} vencerá en ${daysUntilExpiration} días.`,
              read: false, // Marcar como no leída si ya existía
            },
          });
        }
        // Si existe una crítica para la misma licencia, eliminarla
        if (existingCriticalNotif) {
          await prisma.notification.delete({
            where: { id: existingCriticalNotif.id },
          });
        }
      } else {
        // Si la licencia no está vencida ni próxima a vencer, eliminar cualquier notificación existente para ella
        if (existingWarningNotif) {
          await prisma.notification.delete({
            where: { id: existingWarningNotif.id },
          });
        }
        if (existingCriticalNotif) {
          await prisma.notification.delete({
            where: { id: existingCriticalNotif.id },
          });
        }
      }
    }

    // Ejecutar todas las operaciones de creación y actualización en una transacción
    const createdNotifications = await prisma.$transaction(
      notificationsToCreate.map((data) => prisma.notification.create({ data })),
    );

    const updatedNotifications = await prisma.$transaction(
      notificationsToUpdate.map(({ id, data }) =>
        prisma.notification.update({ where: { id }, data }),
      ),
    );

    return NextResponse.json(
      {
        message: "License check and notifications updated successfully.",
        created: createdNotifications.length,
        updated: updatedNotifications.length,
        notifications: [...createdNotifications, ...updatedNotifications], // Devolver las notificaciones creadas/actualizadas
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
