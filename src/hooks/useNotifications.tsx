import React, { useState, useEffect, useCallback, useRef } from "react";
import { App } from "antd";
import { Notification, NotificationType } from "@/types/notification";
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { differenceInDays, isPast } from "date-fns";
import { useSession } from "next-auth/react";

interface Driver {
  id: number;
  nombre: string;
  fecha_vencimiento_licencia: string;
}

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

const getNotificationIcon = (type: NotificationType) => {
  const style = {
    info: { color: "#1890ff" },
    success: { color: "#52c41a" },
    warning: { color: "#faad14" },
    error: { color: "#ff4d4f" },
    critical: { color: "#ff4d4f" },
  };
  switch (type) {
    case "info":
      return <InfoCircleOutlined style={style.info} />;
    case "success":
      return <CheckCircleOutlined style={style.success} />;
    case "warning":
      return <WarningOutlined style={style.warning} />;
    case "error":
      return <CloseCircleOutlined style={style.error} />;
    case "critical":
      return <ExclamationCircleOutlined style={style.critical} />;
    default:
      return null;
  }
};

const getNotificationColor = (type: NotificationType) => {
  const colors = {
    info: "#1890ff",
    success: "#52c41a",
    warning: "#faad14",
    error: "#ff4d4f",
    critical: "#ff4d4f",
  };
  return colors[type] || colors.info;
};

export const useNotifications = (): UseNotificationsHook => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();
  const { notification, modal } = App.useApp();
  const licenseCheckCompletedForSession = useRef<string | null>(null); // Stores session ID or null

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

  // Helper function to display a notification (toast or modal)
  const displayNotification = useCallback(
    (notif: Notification) => {
      if (notif.type === "critical") {
        modal.error({
          title: "Notificación Crítica",
          content: notif.message,
          okText: "Entendido",
          icon: getNotificationIcon(notif.type),
          centered: true,
          onOk: () => markAsRead(notif.id),
        });
      } else {
        notification.open({
          message: notif.message,
          description: notif.details,
          icon: getNotificationIcon(notif.type),
          style: {
            borderLeft: `5px solid ${getNotificationColor(notif.type)}`,
          },
          onClick: () => {
            markAsRead(notif.id);
            if (notif.link) window.location.href = notif.link;
          },
        });
      }
    },
    [notification, modal], // Add notification and modal to dependencies
  );

  const addNotification = useCallback(
    async (
      notificationData: {
        type: NotificationType;
        message: string;
        details?: string;
        link?: string;
      },
      showToast: boolean = true, // Default to showing toast
    ) => {
      if (!session) return;

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationData),
      });

      if (response.ok) {
        const newNotification: Notification = await response.json();
        setNotifications((prev) =>
          [newNotification, ...prev].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        );

        if (showToast) {
          displayNotification(newNotification); // Use the new display function
        }
      }
    },
    [session, displayNotification], // Add displayNotification to dependencies
  );

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const fetchDriversAndGenerateNotifications = async () => {
      if (!session) {
        console.log(
          "[Notifications] No session found, skipping driver license check.",
        );
        // If session is null, reset the flag so it runs on next login
        licenseCheckCompletedForSession.current = null;
        return;
      }

      // Only run if session ID has changed or it's the first run for this session
      if (licenseCheckCompletedForSession.current === session.user.id) {
        console.log(
          "[Notifications] Initial license check already performed for this session. Skipping.",
        );
        return;
      }
      licenseCheckCompletedForSession.current = session.user.id; // Mark as completed for this session

      try {
        console.log(
          "[Notifications] Fetching drivers for license expiration check...",
        );
        const response = await fetch("/api/drivers");
        if (!response.ok) throw new Error("Failed to fetch drivers");
        const { data: drivers } = await response.json();
        console.log(
          `[Notifications] Found ${drivers.length} drivers.`,
          drivers,
        );

        if (drivers.length === 0) return;

        const existingNotificationsResponse = await fetch("/api/notifications");
        if (!existingNotificationsResponse.ok)
          throw new Error("Failed to fetch existing notifications");
        const existingNotifications: Notification[] =
          await existingNotificationsResponse.json();
        console.log(
          `[Notifications] Found ${existingNotifications.length} existing notifications.`,
        );

        for (const driver of drivers) {
          const expirationDate = new Date(driver.fecha_vencimiento_licencia);
          const daysUntilExpiration = differenceInDays(
            expirationDate,
            new Date(),
          );

          console.log(
            `[Notifications] Checking driver: ${driver.nombre}, License expires on: ${expirationDate.toLocaleDateString()}, Days left: ${daysUntilExpiration}`,
          );

          // Use existingNotifications (from DB) for existence checks
          const warningExists = existingNotifications.some(
            (n: Notification) =>
              n.link === `/fleet/drivers/${driver.id}` && n.type === "warning",
          );
          const criticalExists = existingNotifications.some(
            (n: Notification) =>
              n.link === `/fleet/drivers/${driver.id}` && n.type === "critical",
          );

          if (isPast(expirationDate)) {
            if (!criticalExists) {
              console.log(
                `[Notifications] CREATING CRITICAL notification for ${driver.nombre}.`,
              );
              await addNotification(
                {
                  type: "critical",
                  message: `Licencia Vencida: ${driver.nombre}`,
                  details: `La licencia de conducción del conductor ${driver.nombre} ha vencido.`,
                  link: `/fleet/drivers/${driver.id}`,
                },
                true, // Show this critical alert immediately
              );
            } else {
              console.log(
                `[Notifications] RE-DISPLAYING CRITICAL notification for ${driver.nombre}.`,
              );
              const existingCriticalNotif = existingNotifications.find(
                (n: Notification) =>
                  n.link === `/fleet/drivers/${driver.id}` &&
                  n.type === "critical",
              );
              if (existingCriticalNotif) {
                displayNotification(existingCriticalNotif);
              }
            }
          } else if (daysUntilExpiration <= 30 && daysUntilExpiration >= 0) {
            if (!warningExists) {
              console.log(
                `[Notifications] CREATING WARNING notification for ${driver.nombre}.`,
              );
              await addNotification(
                {
                  type: "warning",
                  message: `Licencia Próxima a Vencer: ${driver.nombre}`,
                  details: `La licencia del conductor ${driver.nombre} vencerá en ${daysUntilExpiration} días.`,
                  link: `/fleet/drivers/${driver.id}`,
                },
                true, // Show this warning toast immediately
              );
            } else {
              console.log(
                `[Notifications] RE-DISPLAYING WARNING notification for ${driver.nombre}.`,
              );
              const existingWarningNotif = existingNotifications.find(
                (n: Notification) =>
                  n.link === `/fleet/drivers/${driver.id}` &&
                  n.type === "warning",
              );
              if (existingWarningNotif) {
                displayNotification(existingWarningNotif);
              }
            }
          } else {
            console.log(
              `[Notifications] No notification needed for ${driver.nombre}.`,
            );
          }
        }
      } catch (error) {
        console.error("Error checking driver licenses:", error);
      }
    };

    fetchDriversAndGenerateNotifications();
    const interval = setInterval(
      fetchDriversAndGenerateNotifications,
      86400000,
    ); // Check once a day
    return () => clearInterval(interval);
  }, [session, addNotification, displayNotification]); // Added displayNotification to dependencies

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
