import { Notification, NotificationChecker } from "@/types/notification";

class NotificationManager {
  private checkers: NotificationChecker[] = [];

  register(checker: NotificationChecker) {
    this.checkers.push(checker);
  }

  async generateAllNotifications(userId: string): Promise<Notification[]> {
    const allNotifications: Notification[] = [];

    for (const checker of this.checkers) {
      try {
        const notifications = await checker.check(userId);
        allNotifications.push(...notifications);
      } catch (error) {
        console.error("Error executing a notification checker:", error);
      }
    }

    return allNotifications;
  }
}

export const notificationManager = new NotificationManager();
