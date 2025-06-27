"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Notification, NotificationType } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails?: (notification: Notification) => void;
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

const getNotificationColorClass = (type: NotificationType) => {
  switch (type) {
    case 'info':
      return 'border-blue-500';
    case 'success':
      return 'border-green-500';
    case 'warning':
      return 'border-orange-500';
    case 'error':
    case 'critical':
      return 'border-red-500';
    default:
      return 'border-gray-300';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onViewDetails,
}) => {
  const timeAgo = formatDistanceToNow(new Date(notification.date), { addSuffix: true, locale: es });

  return (
    <li
      role="menuitem"
      className={`flex items-center gap-4 rounded-lg px-2 py-1.5 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3 ${
        notification.read ? 'opacity-60' : ''
      } border-l-4 ${getNotificationColorClass(notification.type)}`}
    >
      <div className="flex-shrink-0">
        {getNotificationIcon(notification.type)}
      </div>

      <Link
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onMarkAsRead(notification.id);
          if (onViewDetails) onViewDetails(notification);
        }}
        className="flex-grow"
      >
        <div>
          <strong className="block text-sm font-medium text-dark dark:text-white">
            {notification.message}
          </strong>
          {notification.details && (
            <span className="truncate text-sm font-medium text-dark-5 dark:text-dark-6">
              {notification.details}
            </span>
          )}
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            {timeAgo}
          </span>
        </div>
      </Link>
      <div className="flex flex-col gap-2">
        {!notification.read && (
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onMarkAsRead(notification.id)}
            size="small"
            title="Marcar como leída"
          />
        )}
        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => onDelete(notification.id)}
          size="small"
          danger
          title="Eliminar"
        />
      </div>
    </li>
  );
};
