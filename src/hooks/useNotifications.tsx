import React, { useState, useEffect, useCallback } from 'react';
import { notification, Modal } from 'antd';
import { Notification, NotificationType } from '@/types/notification';
import { v4 as uuidv4 } from 'uuid';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { differenceInDays, isPast } from 'date-fns';

// Define a minimal Driver type to avoid direct Prisma client import in frontend hook
interface Driver {
  id: number;
  nombre: string;
  fecha_vencimiento_licencia: string; // ISO string
}

interface UseNotificationsHook {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (type: NotificationType, message: string, details?: string, userId?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'info':
      return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    case 'success':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'warning':
      return <WarningOutlined style={{ color: '#faad14' }} />;
    case 'error':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    case 'critical':
      return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
    default:
      return null;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'info':
      return '#1890ff'; // Blue
    case 'success':
      return '#52c41a'; // Green
    case 'warning':
      return '#faad14'; // Orange
    case 'error':
    case 'critical':
      return '#ff4d4f'; // Red
    default:
      return '#1890ff';
  }
};

export const useNotifications = (): UseNotificationsHook => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: NotificationType, message: string, details?: string, userId: string = 'defaultUser') => {
    const newNotification: Notification = {
      id: uuidv4(),
      type,
      message,
      details,
      date: new Date().toISOString(),
      read: false,
      userId,
    };

    setNotifications((prev) => [newNotification, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    if (type === 'critical') {
      Modal.error({
        title: 'Notificación Crítica',
        content: message,
        okText: 'Entendido',
        icon: getNotificationIcon(type),
        centered: true,
        onOk: () => markAsRead(newNotification.id),
      });
    } else {
      notification.open({
        message: newNotification.message,
        description: newNotification.details,
        icon: getNotificationIcon(type),
        style: {
          borderLeft: `5px solid ${getNotificationColor(type)}`,
        },
        onClick: () => {
          markAsRead(newNotification.id);
        },
      });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  // Fetch drivers and generate notifications based on license expiration
  useEffect(() => {
    const fetchDriversAndGenerateNotifications = async () => {
      try {
        const response = await fetch('/api/drivers');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { data: drivers } = await response.json();

        drivers.forEach((driver: Driver) => {
          const licenseExpirationDate = new Date(driver.fecha_vencimiento_licencia);
          const today = new Date();

          if (isPast(licenseExpirationDate) && !notifications.some(n => n.userId === `driver-${driver.id}-expired` && n.type === 'critical')) {
            addNotification(
              'critical',
              'Licencia de Conducción Vencida',
              `La licencia del conductor ${driver.nombre} ha vencido.`,
              `driver-${driver.id}-expired`
            );
          } else {
            const daysUntilExpiration = differenceInDays(licenseExpirationDate, today);
            if (daysUntilExpiration <= 30 && daysUntilExpiration >= 0 && !notifications.some(n => n.userId === `driver-${driver.id}-warning` && n.type === 'warning')) {
              addNotification(
                'warning',
                'Licencia de Conducción Próxima a Vencer',
                `La licencia del conductor ${driver.nombre} vencerá en ${daysUntilExpiration} días.`,
                `driver-${driver.id}-warning`
              );
            }
          }
        });
      } catch (error) {
        console.error('Error fetching drivers for notifications:', error);
      }
    };

    // Fetch immediately and then every hour
    fetchDriversAndGenerateNotifications();
    const interval = setInterval(fetchDriversAndGenerateNotifications, 3600000); // Every hour

    return () => clearInterval(interval);
  }, [addNotification, notifications]); // Add notifications to dependency array to prevent duplicate notifications

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
