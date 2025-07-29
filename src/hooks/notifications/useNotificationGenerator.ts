import { useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

import { Notification } from "@/types/notification";

interface UseNotificationGeneratorHook {
  generateNotifications: () => Promise<void>;
}

export const useNotificationGenerator = (
  refreshNotifications: () => Promise<void>,
  displayNotification: (notif: Notification) => void,
): UseNotificationGeneratorHook => {
  const { data: session } = useSession();
  const generationCompletedForSession = useRef<string | null>(null);

  const generateNotifications = useCallback(async () => {
    if (!session || !session.user || !session.user.id) {
      console.log(
        "[Notifications] No session found or user ID, skipping notification generation.",
      );
      generationCompletedForSession.current = null;
      return;
    }

    if (generationCompletedForSession.current === session.user.id) {
      console.log(
        "[Notifications] Initial generation already performed for this session. Skipping.",
      );
      return;
    }
    generationCompletedForSession.current = session.user.id;

    try {
      console.log(
        "[Notifications] Calling backend for notification generation...",
      );
      const response = await fetch("/api/notifications/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to generate notifications: ${errorData.message || response.statusText}`,
        );
      }

      const result = await response.json();
      console.log("[Notifications] Backend generation complete:", result);

      if (result.notifications && Array.isArray(result.notifications)) {
        result.notifications.forEach((notif: Notification) => {
          if (!notif.read) {
            displayNotification(notif);
          }
        });
      }

      await refreshNotifications();
    } catch (error) {
      console.error("Error generating notifications:", error);
    }
  }, [session, refreshNotifications, displayNotification]);

  useEffect(() => {
    if (
      session?.user?.id &&
      generationCompletedForSession.current !== session.user.id
    ) {
      generateNotifications();
    }
  }, [session, generateNotifications]);

  return { generateNotifications };
};
