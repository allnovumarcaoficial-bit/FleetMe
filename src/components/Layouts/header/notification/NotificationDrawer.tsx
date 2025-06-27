"use client";

import React, { useState, useEffect } from 'react';
import { Drawer, Table, Button, Tag, Space, Popconfirm } from 'antd';
import type { TableProps } from 'antd';
import { Notification, NotificationType } from '@/types/notification';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onMarkAllAsRead: () => void;
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
      return 'blue';
    case 'success':
      return 'green';
    case 'warning':
      return 'orange';
    case 'error':
    case 'critical':
      return 'red';
    default:
      return 'default';
  }
};

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open,
  onClose,
  notifications,
  onMarkAsRead,
  onDeleteNotification,
  onMarkAllAsRead,
}) => {
  const [drawerWidth, setDrawerWidth] = useState('100%');

  useEffect(() => {
    const handleResize = () => {
      setDrawerWidth(window.innerWidth > 768 ? '50%' : '100%');
    };

    if (typeof window !== 'undefined') {
      handleResize(); // Set initial width when drawer opens
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [open]);

  const columns: TableProps<Notification>['columns'] = [
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: NotificationType) => (
        <Tag icon={getNotificationIcon(type)} color={getNotificationColor(type)}>
          {type.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Info', value: 'info' },
        { text: 'Éxito', value: 'success' },
        { text: 'Advertencia', value: 'warning' },
        { text: 'Error', value: 'error' },
        { text: 'Crítica', value: 'critical' },
      ],
      onFilter: (value, record) => record.type.indexOf(value as string) === 0,
    },
    {
      title: 'Mensaje',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Detalles',
      dataIndex: 'details',
      key: 'details',
      render: (text) => text || '-',
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es }),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Leída',
      dataIndex: 'read',
      key: 'read',
      render: (read: boolean) => (read ? <Tag color="green">Sí</Tag> : <Tag color="red">No</Tag>),
      filters: [
        { text: 'Leída', value: true },
        { text: 'No Leída', value: false },
      ],
      onFilter: (value, record) => record.read === value,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {!record.read && (
            <Button
              icon={<EyeOutlined />}
              onClick={() => onMarkAsRead(record.id)}
              title="Marcar como leída"
            />
          )}
          <Popconfirm
            title="¿Estás seguro de eliminar esta notificación?"
            onConfirm={() => onDeleteNotification(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger title="Eliminar" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Drawer
      title="Historial de Notificaciones"
      placement="right"
      onClose={onClose}
      open={open}
      width={drawerWidth}
      extra={
        <Button onClick={onMarkAllAsRead} disabled={notifications.every(n => n.read)}>
          Marcar todas como leídas
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={notifications}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </Drawer>
  );
};
