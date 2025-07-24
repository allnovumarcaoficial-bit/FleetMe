import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Notification, NotificationType } from "@/types/notification";
import { useNotificationDisplay } from "./notifications/useNotificationDisplay";
import { useNotificationCreation } from "./notifications/useNotificationCreation";
import { useLicenseCheckNotifications } from "./notifications/useLicenseCheckNotifications";

interface UseNotificationsHook {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notificationData: {
      type: NotificationType;
      message: string;
      details?: string;
      link?: string;
    },
    showToast?: boolean,
  ) => Promise<void>;
  markAsRead: (
    id: string,
    updatedData?: Partial<Notification>,
  ) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAsUnread: (
    id: string,
    updatedData?: Partial<Notification>,
  ) => Promise<void>;
}

export const useNotifications = (): UseNotificationsHook => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();

  const markAsRead = useCallback(
    async (id: string, updatedData?: Partial<Notification>) => {
      const originalNotifications = notifications; // Guardar estado previo
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: true, ...updatedData } : n,
        ),
      );
      try {
        const response = await fetch(`/api/notifications/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ read: true, ...updatedData }),
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        setNotifications(originalNotifications); // Revertir estado
      }
    },
    [notifications],
  );

  const markAsUnread = useCallback(
    async (id: string, updatedData?: Partial<Notification>) => {
      const originalNotifications = notifications; // Guardar estado previo
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: false, ...updatedData } : n,
        ),
      );
      try {
        const response = await fetch(`/api/notifications/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ read: false, ...updatedData }),
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error("Failed to mark notification as unread");
        }
      } catch (error) {
        console.error("Error marking notification as unread:", error);
        setNotifications(originalNotifications); // Revertir estado
      }
    },
    [notifications],
  );

  const markAllAsRead = useCallback(async () => {
    const originalNotifications = notifications; // Guardar estado previo
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const response = await fetch("/api/notifications/mark-all-as-read", {
        method: "PATCH",
      });
      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      setNotifications(originalNotifications); // Revertir estado
    }
  }, [notifications]);

  const deleteNotification = useCallback(
    async (id: string) => {
      const originalNotifications = notifications; // Guardar estado previo
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      try {
        const response = await fetch(`/api/notifications/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete notification");
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
        setNotifications(originalNotifications); // Revertir estado
      }
    },
    [notifications],
  );

  const { displayNotification } = useNotificationDisplay(markAsRead);
  const { addNotification } = useNotificationCreation(
    setNotifications,
    displayNotification,
  );
  const fetchNotifications = useCallback(async () => {
    if (!session) return;
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data: Notification[] = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [session]);

  const { checkLicenses } = useLicenseCheckNotifications(
    addNotification,
    displayNotification,
    markAsUnread,
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    checkLicenses();
  }, [checkLicenses]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    markAsUnread,
  };
};
