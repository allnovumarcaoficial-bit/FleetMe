'use client';

import { useEffect, useState, useCallback } from 'react';
import { Vehicle, VehicleStatus } from '@/types/fleet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { TrashIcon, PencilSquareIcon } from '@/assets/icons';
import { PreviewIcon } from '@/components/Tables/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/Tables/Pagination';
import AdvancedTableFilter, {
  ColumnFilter,
  ActiveFilters,
} from '../PageElements/AdvancedTableFilter';
import { Alert } from '@/components/ui-elements/alert';
import type { Dayjs } from 'dayjs';
import { Button } from 'antd';
import { MenuDropDowndTable } from '@/components/Charts/chartDownload';
import * as XLSX from 'xlsx';

const VehiclesTable = () => {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [actionStatus, setActionStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });

  const vehicleColumns: ColumnFilter[] = [
    { key: 'marca', title: 'Marca', type: 'text' },
    { key: 'modelo', title: 'Modelo', type: 'text' },
    { key: 'vin', title: 'VIN', type: 'text' },
    { key: 'matricula', title: 'Matrícula', type: 'text' },
    {
      key: 'estado',
      title: 'Estado',
      type: 'select',
      options: [
        { value: 'Activo', label: 'Activo' },
        { value: 'Inactivo', label: 'Inactivo' },
        { value: 'En Mantenimiento', label: 'En Mantenimiento' },
        { value: 'Baja', label: 'Baja' },
      ],
    },
    { key: 'fecha_compra', title: 'Fecha de Compra', type: 'dateRange' },
    {
      key: 'fecha_vencimiento_licencia_operativa',
      title: 'Vencimiento Licencia Operativa',
      type: 'dateRange',
    },
    {
      key: 'fecha_vencimiento_circulacion',
      title: 'Vencimiento Circulación',
      type: 'dateRange',
    },
    {
      key: 'fecha_vencimiento_somaton',
      title: 'Vencimiento Somatón',
      type: 'dateRange',
    },
    { key: 'gps', title: 'GPS', type: 'boolean' },
    { key: 'tipo_vehiculo', title: 'Tipo de Vehículo', type: 'text' },
    { key: 'driver', title: 'Conductor Asignado', type: 'text' },
  ];

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (activeFilters.globalSearch) {
        params.append('search', activeFilters.globalSearch);
      }

      if (activeFilters.columnFilters) {
        for (const key in activeFilters.columnFilters) {
          const value = activeFilters.columnFilters[key];
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              if (key === 'fecha_compra' && value[0] && value[1]) {
                const [startDate, endDate] = value as [Dayjs, Dayjs];
                params.append('fechaCompraDesde', startDate.toISOString());
                params.append('fechaCompraHasta', endDate.toISOString());
              } else if (
                key === 'fecha_vencimiento_licencia_operativa' &&
                value[0] &&
                value[1]
              ) {
                const [startDate, endDate] = value as [Dayjs, Dayjs];
                params.append(
                  'fechaVencimientoLicenciaOperativaDesde',
                  startDate.toISOString()
                );
                params.append(
                  'fechaVencimientoLicenciaOperativaHasta',
                  endDate.toISOString()
                );
              } else if (
                key === 'fecha_vencimiento_circulacion' &&
                value[0] &&
                value[1]
              ) {
                const [startDate, endDate] = value as [Dayjs, Dayjs];
                params.append(
                  'fechaVencimientoCirculacionDesde',
                  startDate.toISOString()
                );
                params.append(
                  'fechaVencimientoCirculacionHasta',
                  endDate.toISOString()
                );
              } else if (
                key === 'fecha_vencimiento_somaton' &&
                value[0] &&
                value[1]
              ) {
                const [startDate, endDate] = value as [Dayjs, Dayjs];
                params.append(
                  'fechaVencimientoSomatonDesde',
                  startDate.toISOString()
                );
                params.append(
                  'fechaVencimientoSomatonHasta',
                  endDate.toISOString()
                );
              } else if (value.length > 0) {
                params.append(key, value.join(','));
              }
            } else if (typeof value === 'boolean') {
              params.append(key, value.toString());
            } else {
              params.append(key, value.toString());
            }
          }
        }
      }

      const response = await fetch(`/api/vehicles?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setVehicles(result.data);
      setTotalVehicles(result.total);
      setTotalPages(result.totalPages);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, activeFilters]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleFilterChange = useCallback((filters: ActiveFilters) => {
    setActiveFilters(filters);
    setPage(1); // Reset to first page on filter change
  }, []);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm('¿Estás seguro de que quieres eliminar este vehículo?')
    ) {
      setActionStatus({ type: '', message: '' });
      try {
        const response = await fetch(`/api/vehicles/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al eliminar el vehículo.');
        }
        setActionStatus({
          type: 'success',
          message: 'Vehículo eliminado exitosamente.',
        });
        fetchVehicles(); // Re-fetch vehicles after deletion
      } catch (e: any) {
        setActionStatus({
          type: 'error',
          message: e.message || 'Ocurrió un error al eliminar el vehículo.',
        });
      }
    }
  };
  const exportToExcel = () => {
    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();

    // Preparar los datos en el formato correcto
    const datosFormateados = vehicles.map((item) => ({
      Marca: item.marca,
      Modelo: item.modelo,
      VIN: item.vin,
      Matrícula: item.matricula,
      'Tipo de Vehículo': item.tipo_vehiculo,
      Estado: item.estado,
    }));

    // Crear una hoja de trabajo a partir de los datos
    const ws = XLSX.utils.json_to_sheet(datosFormateados);

    // Ajustar el ancho de las columnas para mejor visualización
    const columnWidths = [
      { wch: 25 }, // Nombre de Tipo de combustible
      { wch: 10 }, // Precio
      { wch: 20 }, // Última Actualización
      { wch: 10 }, // Moneda
    ];
    ws['!cols'] = columnWidths;

    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Conductores');

    // Escribir el archivo y forzar la descarga
    XLSX.writeFile(wb, 'Conductores.xlsx');
  };
  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      {actionStatus.type && (
        <Alert
          variant={actionStatus.type === 'success' ? 'success' : 'error'}
          title={actionStatus.type === 'success' ? 'Éxito' : 'Error'}
          description={actionStatus.message}
        />
      )}

      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <AdvancedTableFilter
          columns={vehicleColumns}
          onFilterChange={handleFilterChange}
          loading={loading}
          applyFiltersAutomatically={true}
        />
        <Link href="/fleet/vehicles/new">
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
            Crear Vehículo
          </button>
        </Link>
      </div>

      {loading ? (
        <p>Cargando vehículos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="mx-auto flex justify-end">
            <MenuDropDowndTable exportToExcel={exportToExcel} />
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
                <TableHead
                  className="min-w-[155px] cursor-pointer xl:pl-7.5"
                  onClick={() => handleSort('marca')}
                >
                  Marca{' '}
                  {sortBy === 'marca' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('modelo')}
                >
                  Modelo{' '}
                  {sortBy === 'modelo' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('vin')}
                >
                  VIN {sortBy === 'vin' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('matricula')}
                >
                  Matrícula{' '}
                  {sortBy === 'matricula' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('estado')}
                >
                  Estado{' '}
                  {sortBy === 'estado' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('tipo_vehiculo')}
                >
                  Tipo{' '}
                  {sortBy === 'tipo_vehiculo' &&
                    (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead className="text-right xl:pr-7.5">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  className="border-[#eee] dark:border-dark-3"
                >
                  <TableCell className="min-w-[155px] xl:pl-7.5">
                    <h5 className="text-dark dark:text-white">
                      {vehicle.marca}
                    </h5>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {vehicle.modelo}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">{vehicle.vin}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {vehicle.matricula}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        'max-w-fit rounded-full px-3.5 py-1 text-sm font-medium',
                        {
                          'bg-[#219653]/[0.08] text-[#219653]':
                            vehicle.estado === 'Activo',
                          'bg-[#D34053]/[0.08] text-[#D34053]':
                            vehicle.estado === 'Inactivo',
                          'bg-[#FFA70B]/[0.08] text-[#FFA70B]':
                            vehicle.estado === 'En Mantenimiento',
                        }
                      )}
                    >
                      {vehicle.estado}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {vehicle.tipo_vehiculo}
                    </p>
                  </TableCell>
                  <TableCell className="xl:pr-7.5">
                    <div className="flex items-center justify-end gap-x-3.5">
                      <Link
                        href={`/fleet/vehicles/${vehicle.id}`}
                        className="hover:text-primary"
                      >
                        <span className="sr-only">Ver Vehículo</span>
                        <PreviewIcon />
                      </Link>
                      <Button
                        variant="dashed"
                        size="small"
                        ghost
                        className="border-none hover:bg-transparent"
                      >
                        <Link
                          href={`/fleet/vehicles/${vehicle.id}/edit`}
                          className="hover:text-primary"
                        >
                          <span className="sr-only">Editar Vehículo</span>
                          <PencilSquareIcon className="text-black hover:text-primary dark:text-white dark:hover:text-primary" />
                        </Link>
                      </Button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="hover:text-primary"
                      >
                        <span className="sr-only">Eliminar Vehículo</span>
                        <TrashIcon />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            current={page}
            total={totalVehicles}
            pageSize={limit}
            onChange={(p, ps) => {
              setPage(p);
              setLimit(ps);
            }}
            onShowSizeChange={(current, size) => {
              setPage(current);
              setLimit(size);
            }}
          />
        </>
      )}
    </div>
  );
};

export default VehiclesTable;
