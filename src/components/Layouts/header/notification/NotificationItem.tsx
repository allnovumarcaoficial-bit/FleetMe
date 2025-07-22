"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Notification, NotificationType } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "info":
      return <InfoCircleOutlined style={{ color: "#1890ff" }} />;
    case "success":
      return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
    case "warning":
      return <WarningOutlined style={{ color: "#faad14" }} />;
    case "error":
      return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
    case "critical":
      return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
    default:
      return null;
  }
};

const getNotificationColorClass = (type: NotificationType) => {
  switch (type) {
    case "info":
      return "border-blue-500";
    case "success":
      return "border-green-500";
    case "warning":
      return "border-orange-500";
    case "error":
    case "critical":
      return "border-red-500";
    default:
      return "border-gray-300";
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const timeAgo = formatDistanceToNow(new Date(notification.date), {
    addSuffix: true,
    locale: es,
  });

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <li
      className={`group flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-gray-2 dark:hover:bg-dark-3 ${
        notification.read ? "opacity-70" : ""
      } border-l-4 ${getNotificationColorClass(notification.type)}`}
    >
      <div className="mt-0.5 flex-shrink-0 text-lg">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="flex-grow">
        <Link
          href={notification.link || "#"}
          onClick={handleItemClick}
          className="block outline-none"
        >
          <p className="font-semibold text-dark dark:text-white">
            {notification.message}
          </p>
          {notification.details && (
            <p className="text-sm text-dark-5 dark:text-dark-6">
              {notification.details}
            </p>
          )}
          <p className="text-xs text-dark-4 dark:text-dark-5">{timeAgo}</p>
        </Link>
      </div>

      <Tooltip title="Eliminar Notificación">
        <Button
          type="text"
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="opacity-0 group-hover:opacity-100"
          danger
        />
      </Tooltip>
    </li>
  );
};
