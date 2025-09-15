import { useTheme } from 'next-themes';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Input,
  Button,
  Dropdown,
  Space,
  DatePicker,
  Switch,
  Select,
  Badge,
  Drawer,
  Form,
  Row,
  Col,
  Spin,
} from 'antd';
import {
  FilterOutlined,
  SearchOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { useIsMobile } from '@/hooks/use-mobile';
import type { MenuProps } from 'antd'; // Keep moment for now for compatibility with existing data if any
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export type FilterType = 'text' | 'select' | 'dateRange' | 'boolean';

export interface ColumnFilter {
  key: string;
  title: string;
  type: FilterType;
  options?: { value: string | number | boolean; label: string }[]; // For 'select' type
}

export interface ActiveFilters {
  globalSearch?: string;
  columnFilters?: {
    [key: string]: string | string[] | [Dayjs, Dayjs] | boolean | undefined;
  };
}

interface AdvancedTableFilterProps {
  columns: ColumnFilter[];
  onFilterChange: (filters: ActiveFilters) => void;
  loading?: boolean;
  applyFiltersAutomatically?: boolean;
}

const AdvancedTableFilter: React.FC<AdvancedTableFilterProps> = ({
  columns,
  onFilterChange,
  loading = false,
  applyFiltersAutomatically = true,
}) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [globalSearchText, setGlobalSearchText] = useState<string>('');
  const [columnFilters, setColumnFilters] = useState<
    ActiveFilters['columnFilters']
  >({});
  const [activeFilterCount, setActiveFilterCount] = useState<number>(0);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  const calculateActiveFilters = useCallback(() => {
    let count = 0;
    if (globalSearchText) {
      count++;
    }
    for (const key in columnFilters) {
      const value = columnFilters[key];
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        count++;
      }
    }
    setActiveFilterCount(count);
  }, [globalSearchText, columnFilters]);

  useEffect(() => {
    calculateActiveFilters();
  }, [globalSearchText, columnFilters, calculateActiveFilters]);

  const applyFilters = useCallback(() => {
    const filters: ActiveFilters = {
      globalSearch: globalSearchText,
      columnFilters: columnFilters,
    };
    onFilterChange(filters);
  }, [globalSearchText, columnFilters, onFilterChange]);

  useEffect(() => {
    if (applyFiltersAutomatically) {
      applyFilters();
    }
  }, [
    globalSearchText,
    columnFilters,
    applyFiltersAutomatically,
    applyFilters,
  ]);

  const handleGlobalSearch = (value: string) => {
    setGlobalSearchText(value);
  };

  const handleColumnFilterChange = (key: string, value: any) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setGlobalSearchText('');
    setColumnFilters({});
    form.resetFields();
    if (applyFiltersAutomatically) {
      onFilterChange({}); // Clear all filters
    } else {
      applyFilters(); // Apply cleared filters
    }
  };

  const renderFilterInput = (column: ColumnFilter) => {
    switch (column.type) {
      case 'text':
        return (
          <Input
            placeholder={`Buscar por ${column.title}`}
            onChange={(e) =>
              handleColumnFilterChange(column.key, e.target.value)
            }
            value={columnFilters?.[column.key] as string | undefined}
          />
        );
      case 'select':
        return (
          <Select
            placeholder={`Seleccionar ${column.title}`}
            options={column.options}
            onChange={(value) => handleColumnFilterChange(column.key, value)}
            value={columnFilters?.[column.key] as string | string[] | undefined}
            allowClear
          />
        );
      case 'dateRange':
        const dateRangeValue = columnFilters?.[column.key] as
          | [Dayjs, Dayjs]
          | undefined;
        return (
          <RangePicker
            onChange={(dates) => handleColumnFilterChange(column.key, dates)}
            value={dateRangeValue}
            style={{ width: '100%' }}
          />
        );
      case 'boolean':
        return (
          <Switch
            checkedChildren="Sí"
            unCheckedChildren="No"
            onChange={(checked) =>
              handleColumnFilterChange(column.key, checked)
            }
            checked={columnFilters?.[column.key] as boolean | undefined}
          />
        );
      default:
        return null;
    }
  };

  const filterMenuItems: MenuProps['items'] = columns.map((column) => ({
    key: column.key,
    label: (
      <Form.Item
        name={column.key}
        label={column.title}
        initialValue={columnFilters?.[column.key]}
        style={{ marginBottom: 0 }}
      >
        {renderFilterInput(column)}
      </Form.Item>
    ),
  }));

  const filterContent = (
    <Form form={form} layout="vertical" initialValues={columnFilters}>
      <Row gutter={[16, 16]}>
        {columns.map((column) => (
          <Col xs={24} sm={12} md={8} key={column.key}>
            <Form.Item name={column.key} label={column.title}>
              {renderFilterInput(column)}
            </Form.Item>
          </Col>
        ))}
      </Row>
      {!applyFiltersAutomatically && (
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" onClick={applyFilters}>
            Aplicar Filtros
          </Button>
        </Space>
      )}
    </Form>
  );

  return (
    <Spin spinning={loading}>
      <Space
        style={{
          marginBottom: 16,
          width: '100%',
          justifyContent: 'flex-start',
        }}
      >
        <Input.Search
          placeholder="Búsqueda global..."
          allowClear
          onSearch={handleGlobalSearch}
          onChange={(e) => setGlobalSearchText(e.target.value)}
          value={globalSearchText}
          style={{ width: isMobile ? '100%' : 250 }}
          prefix={<SearchOutlined />}
        />

        {isMobile ? (
          <Button
            icon={<FilterOutlined />}
            onClick={() => setDrawerVisible(true)}
          >
            Filtros ({activeFilterCount})
          </Button>
        ) : (
          <Dropdown
            popupRender={() => (
              <div
                className="bg-white dark:bg-dark-2"
                style={{
                  padding: 16,
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {filterContent}
              </div>
            )}
            trigger={['click']}
            placement="bottomLeft"
            arrow
          >
            <Button icon={<FilterOutlined />}>
              Filtros por Columna{' '}
              <Badge
                count={activeFilterCount}
                offset={[5, -5]}
                showZero={false}
              />
            </Button>
          </Dropdown>
        )}

        <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
          Limpiar
        </Button>
      </Space>

      {isMobile && (
        <Drawer
          title="Filtros Avanzados"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width="80%"
          extra={
            !applyFiltersAutomatically && (
              <Button
                type="primary"
                onClick={() => {
                  applyFilters();
                  setDrawerVisible(false);
                }}
              >
                Aplicar
              </Button>
            )
          }
        >
          {filterContent}
        </Drawer>
      )}
    </Spin>
  );
};

export default AdvancedTableFilter;
