import prisma from '@/lib/prisma';
import { differenceInDays, isPast } from 'date-fns';
import { notificationService } from '@/services/notification.service';
import { Notification, NotificationChecker } from '@/types/notification';
import { notificationManager } from '../notificationManager.service';

class FuelCardChecker implements NotificationChecker {
  async check(userId: string): Promise<Notification[]> {
    const fuelCards = await prisma.fuelCard.findMany({
      where: {
        fechaVencimiento: {
          lte: new Date(new Date().setDate(new Date().getDate() + 30)), // Vence en los próximos 30 días
        },
      },
    });

    if (fuelCards.length === 0) {
      return [];
    }

    const existingNotifications =
      await notificationService.getNotificationsByUserIdAndType(userId, [
        'warning',
        'critical',
      ]);

    const notificationsToCreateOrUpdate: Notification[] = [];
    const notificationsToDeleteIds: string[] = [];

    for (const fuelCard of fuelCards) {
      const expirationDate = new Date(fuelCard.fechaVencimiento);
      const daysUntilExpiration = differenceInDays(expirationDate, new Date());
      const isExpired = isPast(expirationDate);

      const { createdOrUpdatedNotification, notificationsToDelete } =
        await notificationService.handleFuelCardNotification(
          // Necesitamos crear esta función
          userId,
          fuelCard.id,
          fuelCard.numeroDeTarjeta,
          expirationDate,
          isExpired,
          daysUntilExpiration,
          existingNotifications
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

export const fuelCardChecker = new FuelCardChecker();
notificationManager.register(fuelCardChecker);
