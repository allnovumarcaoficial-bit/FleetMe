import prisma from "@/lib/prisma";
import { differenceInDays, isPast } from "date-fns";
import { notificationService } from "@/services/notification.service";
import { Notification, NotificationChecker } from "@/types/notification";
import { notificationManager } from "../notificationManager.service";

class LicenseChecker implements NotificationChecker {
  async check(userId: string): Promise<Notification[]> {
    const drivers = await prisma.driver.findMany({
      where: {
        fecha_vencimiento_licencia: {
          lte: new Date(new Date().setDate(new Date().getDate() + 30)),
        },
      },
    });

    if (drivers.length === 0) {
      return [];
    }

    const existingNotifications =
      await notificationService.getNotificationsByUserIdAndType(userId, [
        "warning",
        "critical",
      ]);

    const notificationsToCreateOrUpdate: Notification[] = [];
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

    if (notificationsToDeleteIds.length > 0) {
      await prisma.notification.deleteMany({
        where: {
          id: {
            in: notificationsToDeleteIds,
          },
        },
      });
    }

    return notificationsToCreateOrUpdate;
  }
}

export const licenseChecker = new LicenseChecker();
notificationManager.register(licenseChecker);
