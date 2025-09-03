'use client';
import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Popconfirm, Form, message } from 'antd';
import type { Rule } from 'antd/es/form';

enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'text' | 'select' | 'password';
  record: User;
  index: number;
}

const { Option } = Select;

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const getInput = () => {
    if (inputType === 'password') {
      return <Input.Password placeholder="Contraseña" />;
    }
    if (inputType === 'select') {
      return (
        <Select disabled placeholder="Seleccionar rol">
          <Option value={Role.USER}>USER</Option>
          <Option value={Role.ADMIN}>ADMIN</Option>
        </Select>
      );
    }
    return <Input placeholder={title} />;
  };

  const rules: Rule[] = [
    {
      required: true,
      message: `Por favor ingrese ${title}!`,
    },
  ];

  if (dataIndex === 'email') {
    rules.push({ type: 'email', message: 'Ingrese un email válido' });
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item name={dataIndex} style={{ margin: 0 }} rules={rules}>
          {getInput()}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

interface UsersTableNotAdminProps {
  userId: string | null;
}

const UsersTableNotAdmin: React.FC<UsersTableNotAdminProps> = ({ userId }) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const isEditing = (record: User) => record.id === editingKey;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = `/api/users/${userId}`;
      const res = await fetch(url, {
        method: 'GET',
      });
      if (res.ok) {
        const data = await res.json();
        // const newData = data.fliter((item: any)=>(item.role === 'USER'))
        // console.log(newData)
        setUsers([data]);
      } else {
        message.error('Error al cargar los usuarios');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Error de conexión al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const edit = (record: Partial<User> & { id: React.Key }) => {
    form.setFieldsValue({ name: '', email: '', role: Role.USER, ...record });
    setEditingKey(record.id);
  };

  const cancel = () => {
    if (isCreating) {
      setUsers(users.filter((user) => !user.id.startsWith('new-user-')));
      setIsCreating(false);
    }
    setEditingKey('');
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as Omit<User, 'id'> & {
        password?: string;
      };

      if (isCreating) {
        // Logic for creating a new user
        if (!row.password) {
          message.error('La contraseña es obligatoria para nuevos usuarios');
          return;
        }
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row),
        });

        if (response.ok) {
          message.success('Usuario creado exitosamente');
          fetchUsers();
          setEditingKey('');
          setIsCreating(false);
        } else {
          const errorData = await response.json();
          message.error(
            `Error al crear el usuario: ${
              errorData.message || response.statusText
            }`
          );
        }
      } else {
        // Logic for updating an existing user
        const url = `/api/users/${key}`;
        const response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row),
        });

        if (response.ok) {
          message.success('Usuario actualizado exitosamente');
          fetchUsers();
          setEditingKey('');
        } else {
          const errorData = await response.json();
          message.error(
            `Error al actualizar el usuario: ${
              errorData.message || response.statusText
            }`
          );
        }
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      editable: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      editable: false,
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      editable: false,
    },
    {
      title: 'Contraseña',
      dataIndex: 'password',
      editable: true,
      render: (_: any, record: User) => {
        return isEditing(record) ? (
          <Form.Item name="password" style={{ margin: 0 }}>
            <Input.Password placeholder="Nueva contraseña" />
          </Form.Item>
        ) : (
          '********'
        );
      },
    },
    {
      title: 'Acciones',
      dataIndex: 'actions',
      render: (_: any, record: User) => {
        const editable = isEditing(record);
        if (editable) {
          return (
            <span>
              <Button
                onClick={() => save(record.id)}
                style={{ marginRight: 8 }}
              >
                Guardar
              </Button>
              <Popconfirm
                title="¿Seguro que quieres cancelar?"
                onConfirm={cancel}
              >
                <Button>Cancelar</Button>
              </Popconfirm>
            </span>
          );
        }
        return (
          <span>
            <Button
              type="link"
              disabled={editingKey !== ''}
              onClick={() => edit(record)}
            >
              Editar
            </Button>
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: User) => ({
        record,
        inputType: col.dataIndex === 'role' ? 'select' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record) && col.dataIndex !== 'password',
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <div className=""></div>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={users}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
        loading={loading}
        rowKey="id"
      />
    </Form>
  );
};

export default UsersTableNotAdmin;
