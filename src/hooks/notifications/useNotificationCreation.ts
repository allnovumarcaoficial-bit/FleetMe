import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { Notification, NotificationType } from "@/types/notification";

interface UseNotificationCreationHook {
  addNotification: (
    notificationData: {
      type: NotificationType;
      message: string;
      details?: string;
      link?: string;
    },
    showToast?: boolean,
  ) => Promise<void>;
}

export const useNotificationCreation = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
  displayNotification: (notif: Notification) => void,
): UseNotificationCreationHook => {
  const { data: session } = useSession();

  const addNotification = useCallback(
    async (
      notificationData: {
        type: NotificationType;
        message: string;
        details?: string;
        link?: string;
      },
      showToast: boolean = true,
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
          displayNotification(newNotification);
        }
      }
    },
    [session, setNotifications, displayNotification],
  );

  return { addNotification };
};
