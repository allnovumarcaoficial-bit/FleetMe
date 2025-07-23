import React, { useState, useEffect, useCallback } from "react";
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
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotifications = (): UseNotificationsHook => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications/mark-all-as-read", { method: "PATCH" });
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
  }, []);

  const { displayNotification } = useNotificationDisplay(markAsRead);
  const { addNotification } = useNotificationCreation(
    setNotifications,
    displayNotification,
  );
  const { checkLicenses } = useLicenseCheckNotifications(
    addNotification,
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
  };
};
