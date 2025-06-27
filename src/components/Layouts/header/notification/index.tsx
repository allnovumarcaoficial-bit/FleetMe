"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { BellIcon } from "./icons";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { NotificationDrawer } from "./NotificationDrawer";
import { Badge } from "antd";

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, addNotification } = useNotifications();



  return (
    <>
      <Dropdown
        isOpen={isOpen}
        setIsOpen={(open) => {
          setIsOpen(open);
        }}
      >
        <DropdownTrigger
          className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
          aria-label="View Notifications"
        >
          <span className="relative">
            <Badge count={unreadCount} offset={[10, -5]} size="small">
              <BellIcon />
            </Badge>
          </span>
        </DropdownTrigger>

        <DropdownContent
          align={isMobile ? "end" : "center"}
          className="border border-stroke bg-white px-3.5 py-3 shadow-md dark:border-dark-3 dark:bg-gray-dark min-[350px]:min-w-[20rem]"
        >
          <div className="mb-1 flex items-center justify-between px-2 py-1.5">
            <span className="text-lg font-medium text-dark dark:text-white">
              Notifications
            </span>
            <span className="rounded-md bg-primary px-[9px] py-0.5 text-xs font-medium text-white">
              {unreadCount} new
            </span>
          </div>

          <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-2 py-1.5 text-center text-sm text-dark-5 dark:text-dark-6">
                No hay notificaciones.
              </li>
            ) : (
              notifications.slice(0, 5).map((notification) => ( // Show last 5 notifications in dropdown
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </ul>

          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              setIsDrawerOpen(true);
            }}
            className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
          >
            See all notifications
          </Link>
        </DropdownContent>
      </Dropdown>

      <NotificationDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onDeleteNotification={deleteNotification}
        onMarkAllAsRead={markAllAsRead}
      />
    </>
  );
}
