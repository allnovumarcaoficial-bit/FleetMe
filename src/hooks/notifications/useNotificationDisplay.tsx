import React from "react";
import { App } from "antd";
import { Notification, NotificationType } from "@/types/notification";
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

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

export const useNotificationDisplay = (
  markAsRead: (id: string) => Promise<void>,
) => {
  const { notification, modal } = App.useApp();

  const displayNotification = (notif: Notification) => {
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
  };

  return { displayNotification };
};
