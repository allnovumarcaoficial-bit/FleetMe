import { useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { differenceInDays, isPast } from "date-fns";
import { Notification, NotificationType } from "@/types/notification";

interface Driver {
  id: number;
  nombre: string;
  fecha_vencimiento_licencia: string;
}

interface UseLicenseCheckNotificationsHook {
  checkLicenses: () => Promise<void>;
}

export const useLicenseCheckNotifications = (
  addNotification: (
    notificationData: {
      type: NotificationType;
      message: string;
      details?: string;
      link?: string;
    },
    showToast?: boolean,
  ) => Promise<void>,
  displayNotification: (notif: Notification) => void,
  markAsUnread: (
    id: string,
    updatedData?: Partial<Notification>,
  ) => Promise<void>,
): UseLicenseCheckNotificationsHook => {
  const { data: session } = useSession();
  const licenseCheckCompletedForSession = useRef<string | null>(null);

  const checkLicenses = useCallback(async () => {
    if (!session) {
      console.log(
        "[Notifications] No session found, skipping driver license check.",
      );
      licenseCheckCompletedForSession.current = null;
      return;
    }

    if (licenseCheckCompletedForSession.current === session.user.id) {
      console.log(
        "[Notifications] Initial license check already performed for this session. Skipping.",
      );
      return;
    }
    licenseCheckCompletedForSession.current = session.user.id;

    try {
      console.log(
        "[Notifications] Fetching drivers for license expiration check...",
      );
      const response = await fetch("/api/drivers");
      if (!response.ok) throw new Error("Failed to fetch drivers");
      const { data: drivers } = await response.json();
      console.log(`[Notifications] Found ${drivers.length} drivers.`, drivers);

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
              true,
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
              const updatedMessage = `Licencia Vencida: ${driver.nombre}`;
              const updatedDetails = `La licencia de conducción del conductor ${driver.nombre} ha vencido.`;
              await markAsUnread(existingCriticalNotif.id, {
                message: updatedMessage,
                details: updatedDetails,
              }); // Mark as unread and update data
              displayNotification({
                ...existingCriticalNotif,
                message: updatedMessage,
                details: updatedDetails,
              });
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
              true,
            );
          } else {
            console.log(
              `[Notifications] RE-DISPLAYING WARNING notification for ${driver.nombre}.`,
            );
            const updatedMessage = `Licencia Próxima a Vencer: ${driver.nombre}`;
            const updatedDetails = `La licencia del conductor ${driver.nombre} vencerá en ${daysUntilExpiration} días.`;
            const existingWarningNotif = existingNotifications.find(
              (n: Notification) =>
                n.link === `/fleet/drivers/${driver.id}` &&
                n.type === "warning",
            );
            if (existingWarningNotif) {
              await markAsUnread(existingWarningNotif.id, {
                message: updatedMessage,
                details: updatedDetails,
              }); // Mark as unread and update data
              displayNotification({
                ...existingWarningNotif,
                message: updatedMessage,
                details: updatedDetails,
              });
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
  }, [session, addNotification, displayNotification, markAsUnread]);

  useEffect(() => {
    checkLicenses();
    const interval = setInterval(checkLicenses, 86400000); // Check once a day
    return () => clearInterval(interval);
  }, [checkLicenses]);

  return { checkLicenses };
};
