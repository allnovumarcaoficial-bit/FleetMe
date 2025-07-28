import { useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

import { Notification } from "@/types/notification";

interface UseLicenseCheckNotificationsHook {
  checkLicenses: () => Promise<void>;
}

export const useLicenseCheckNotifications = (
  refreshNotifications: () => Promise<void>,
  displayNotification: (notif: Notification) => void,
): UseLicenseCheckNotificationsHook => {
  const { data: session } = useSession();
  const licenseCheckCompletedForSession = useRef<string | null>(null);

  const checkLicenses = useCallback(async () => {
    if (!session || !session.user || !session.user.id) {
      console.log(
        "[Notifications] No session found or user ID, skipping driver license check.",
      );
      licenseCheckCompletedForSession.current = null;
      return;
    }

    // Solo ejecutar si la sesión ha cambiado o si no se ha completado para esta sesión
    if (licenseCheckCompletedForSession.current === session.user.id) {
      console.log(
        "[Notifications] Initial license check already performed for this session. Skipping.",
      );
      return;
    }
    licenseCheckCompletedForSession.current = session.user.id;

    try {
      console.log(
        "[Notifications] Calling backend for license expiration check...",
      );
      const response = await fetch("/api/notifications/check-licenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to check licenses: ${errorData.message || response.statusText}`,
        );
      }

      const result = await response.json();
      console.log("[Notifications] Backend check complete:", result);

      // Mostrar las notificaciones devueltas por el backend
      if (result.notifications && Array.isArray(result.notifications)) {
        result.notifications.forEach((notif: Notification) => {
          // Solo mostrar si la notificación es nueva o ha cambiado y no ha sido leída
          if (!notif.read) {
            // Asumiendo que el backend devuelve 'read: false' para nuevas/actualizadas
            displayNotification(notif);
          }
        });
      }

      await refreshNotifications(); // Refrescar las notificaciones después de la actualización del backend
    } catch (error) {
      console.error("Error checking driver licenses:", error);
    }
  }, [session, refreshNotifications, displayNotification]);

  useEffect(() => {
    // Ejecutar la verificación solo cuando la sesión esté disponible y sea una nueva sesión
    if (
      session?.user?.id &&
      licenseCheckCompletedForSession.current !== session.user.id
    ) {
      checkLicenses();
    }
    // Eliminar el setInterval
    // const interval = setInterval(checkLicenses, 86400000); // Check once a day
    // return () => clearInterval(interval);
  }, [session, checkLicenses]); // Dependencia de session para re-evaluar al cambiar la sesión

  return { checkLicenses };
};
