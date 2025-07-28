import prisma from "@/lib/prisma";
import { Notification, NotificationType } from "@/types/notification";

export const notificationService = {
  async getNotificationsByUserIdAndType(
    userId: string,
    types: NotificationType[],
  ) {
    return prisma.notification.findMany({
      where: {
        userId: userId,
        type: {
          in: types,
        },
      },
    });
  },

  async createNotification(
    data: Omit<Notification, "id" | "date"> & { date?: Date },
  ) {
    return prisma.notification.create({
      data: { ...data, date: data.date || new Date() },
    });
  },

  async updateNotification(id: string, data: Partial<Notification>) {
    return prisma.notification.update({ where: { id }, data });
  },

  async deleteNotification(id: string) {
    return prisma.notification.delete({ where: { id } });
  },

  async handleLicenseNotification(
    userId: string,
    driverId: number,
    driverName: string,
    expirationDate: Date,
    isExpired: boolean,
    daysUntilExpiration: number,
    existingNotifications: Notification[],
  ) {
    const link = `/fleet/drivers/${driverId}`;
    const existingWarningNotif = existingNotifications.find(
      (n) => n.link === link && n.type === "warning",
    );
    const existingCriticalNotif = existingNotifications.find(
      (n) => n.link === link && n.type === "critical",
    );

    let createdOrUpdatedNotification: Notification | null = null;
    const notificationsToDelete: string[] = [];

    if (isExpired) {
      // Licencia vencida: Notificación crítica
      if (!existingCriticalNotif) {
        createdOrUpdatedNotification = await this.createNotification({
          userId: userId,
          type: "critical",
          message: `Licencia Vencida: ${driverName}`,
          details: `La licencia de conducción del conductor ${driverName} ha vencido.`,
          link: link,
          read: false,
        });
      } else {
        createdOrUpdatedNotification = await this.updateNotification(
          existingCriticalNotif.id,
          {
            message: `Licencia Vencida: ${driverName}`,
            details: `La licencia de conducción del conductor ${driverName} ha vencido.`,
            read: false,
          },
        );
      }
      if (existingWarningNotif) {
        notificationsToDelete.push(existingWarningNotif.id);
      }
    } else if (daysUntilExpiration <= 30 && daysUntilExpiration >= 0) {
      // Licencia próxima a vencer: Notificación de advertencia
      if (!existingWarningNotif) {
        createdOrUpdatedNotification = await this.createNotification({
          userId: userId,
          type: "warning",
          message: `Licencia Próxima a Vencer: ${driverName}`,
          details: `La licencia del conductor ${driverName} vencerá en ${daysUntilExpiration} días.`,
          link: link,
          read: false,
        });
      } else {
        createdOrUpdatedNotification = await this.updateNotification(
          existingWarningNotif.id,
          {
            message: `Licencia Próxima a Vencer: ${driverName}`,
            details: `La licencia del conductor ${driverName} vencerá en ${daysUntilExpiration} días.`,
            read: false,
          },
        );
      }
      if (existingCriticalNotif) {
        notificationsToDelete.push(existingCriticalNotif.id);
      }
    } else {
      // Si la licencia no está vencida ni próxima a vencer, eliminar cualquier notificación existente para ella
      if (existingWarningNotif) {
        notificationsToDelete.push(existingWarningNotif.id);
      }
      if (existingCriticalNotif) {
        notificationsToDelete.push(existingCriticalNotif.id);
      }
    }
    return { createdOrUpdatedNotification, notificationsToDelete };
  },
};
