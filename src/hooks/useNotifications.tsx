import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Notification, NotificationType } from "@/types/notification";
import { useNotificationDisplay } from "./notifications/useNotificationDisplay";
import { useNotificationCreation } from "./notifications/useNotificationCreation";
import { useNotificationGenerator } from "./notifications/useNotificationGenerator";

// Suponiendo que tiene una función para mostrar toasts/mensajes de error
const showErrorMessage = (message: string) => {
  console.error("Error:", message);
  // Aquí iría la lógica para mostrar un toast o alerta al usuario
  alert(`Error: ${message}`);
};

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
      // Optimistic update
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
      } catch (error: any) {
        console.error("Error marking notification as read:", error);
        showErrorMessage(
          `No se pudo marcar la notificación como leída: ${error.message}`,
        );
        // Revertir el estado si falla
        setNotifications((prev) =>
          prev.map(
            (n) => (n.id === id ? { ...n, read: false } : n), // Asumiendo que el estado original era no leído
          ),
        );
      }
    },
    [], // Dependencia vacía para useCallback, ya que setNotifications es estable
  );

  const markAsUnread = useCallback(
    async (id: string, updatedData?: Partial<Notification>) => {
      // Optimistic update
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
      } catch (error: any) {
        console.error("Error marking notification as unread:", error);
        showErrorMessage(
          `No se pudo marcar la notificación como no leída: ${error.message}`,
        );
        // Revertir el estado si falla
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
      }
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    const originalNotifications = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const response = await fetch("/api/notifications/mark-all-as-read", {
        method: "PATCH",
      });
      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      showErrorMessage(
        `No se pudieron marcar todas las notificaciones como leídas: ${error.message}`,
      );
      setNotifications(originalNotifications);
    }
  }, [notifications]);

  const deleteNotification = useCallback(
    async (id: string) => {
      const originalNotifications = notifications;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      try {
        const response = await fetch(`/api/notifications/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete notification");
        }
      } catch (error: any) {
        console.error("Error deleting notification:", error);
        showErrorMessage(
          `No se pudo eliminar la notificación: ${error.message}`,
        );
        setNotifications(originalNotifications);
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
      } else {
        throw new Error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showErrorMessage("No se pudieron cargar las notificaciones.");
    }
  }, [session]);

  const { generateNotifications } = useNotificationGenerator(
    fetchNotifications,
    displayNotification,
  );

  useEffect(() => {
    if (session) {
      // generateNotifications ya se encarga de llamar a fetchNotifications
      // a través del callback refreshNotifications.
      generateNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]); // Solo debe ejecutarse cuando la sesión cambia.

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
