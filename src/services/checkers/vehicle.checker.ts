import prisma from '@/lib/prisma';
import { differenceInDays, isPast } from 'date-fns';
import { notificationService } from '@/services/notification.service';
import { Notification, NotificationChecker } from '@/types/notification';
import { notificationManager } from '../notificationManager.service';

class VehicleChecker implements NotificationChecker {
  async check(userId: string): Promise<Notification[]> {
    const vehicles = await prisma.vehicle.findMany();

    if (vehicles.length === 0) {
      return [];
    }

    const existingNotifications =
      await notificationService.getNotificationsByUserIdAndType(userId, [
        'warning',
        'critical',
      ]);

    const notificationsToCreateOrUpdate: Notification[] = [];
    const notificationsToDeleteIds: string[] = [];
    let vehicleStateNeedsUpdate = false;

    for (const vehicle of vehicles) {
      const documents = [
        {
          type: 'Licencia Operativa',
          date: vehicle.fecha_vencimiento_licencia_operativa,
        },
        {
          type: 'Circulación',
          date: vehicle.fecha_vencimiento_circulacion,
        },
        { type: 'Somatón', date: vehicle.fecha_vencimiento_somaton },
      ];

      let isAnyDocumentExpired = false;

      for (const doc of documents) {
        const expirationDate = doc.date ? new Date(doc.date) : null;
        const daysUntilExpiration = expirationDate
          ? differenceInDays(expirationDate, new Date())
          : null;
        const isExpired = expirationDate ? isPast(expirationDate) : false;

        if (isExpired) {
          isAnyDocumentExpired = true;
        }

        const { createdOrUpdatedNotification, notificationsToDelete } =
          await notificationService.handleVehicleNotification(
            userId,
            vehicle.id,
            vehicle.matricula,
            doc.type,
            expirationDate || null,
            isExpired,
            daysUntilExpiration || null,
            existingNotifications
          );

        if (createdOrUpdatedNotification) {
          notificationsToCreateOrUpdate.push(createdOrUpdatedNotification);
        }
        notificationsToDeleteIds.push(...notificationsToDelete);
      }

      if (isAnyDocumentExpired && vehicle.estado !== 'Inactivo') {
        vehicleStateNeedsUpdate = true;
        await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: { estado: 'Inactivo' },
        });
      }
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

export const vehicleChecker = new VehicleChecker();
notificationManager.register(vehicleChecker);
