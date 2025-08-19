'use client';

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Servicio, Vehicle, ServicioTipo, ServicioEstado } from '@/types/fleet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrashIcon, PencilSquareIcon } from '@/assets/icons';
import { PreviewIcon } from '@/components/Tables/icons';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui-elements/alert';
import Link from 'next/link';
import { cn, formatDate } from '@/lib/utils';
import Pagination from '@/components/Tables/Pagination';
import AdvancedTableFilter, {
  ColumnFilter,
  ActiveFilters,
} from '../PageElements/AdvancedTableFilter';
import type { Dayjs } from 'dayjs';

interface ServiceTableProps {
  // vehicleId?: number; // This prop will now be handled by AdvancedTableFilter
  // vehicles: Vehicle[]; // These props will now be handled by AdvancedTableFilter
  // loadingVehicles: boolean;
  // errorVehicles: string | null;
  // handleVehicleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const ServiceTable = ({}: ServiceTableProps) => {
  const router = useRouter();
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServicesCount, setTotalServicesCount] = useState(0);
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });

  const serviceColumns: ColumnFilter[] = [
    {
      key: 'tipoServicio',
      title: 'Tipo de Servicio',
      type: 'select',
      options: [
        { value: 'Entrega de Pedidos', label: 'Entrega de Pedidos' },
        { value: 'Logistico', label: 'Logistico' },
        { value: 'Administrativo', label: 'Administrativo' },
      ],
    },
    { key: 'fecha', title: 'Fecha', type: 'dateRange' },
    { key: 'odometroInicial', title: 'Odómetro Inicial', type: 'text' },
    { key: 'odometroFinal', title: 'Odómetro Final', type: 'text' },
    { key: 'kilometrosRecorridos', title: 'Km Recorridos', type: 'text' },
    {
      key: 'estado',
      title: 'Estado',
      type: 'select',
      options: [
        { value: 'Pendiente', label: 'Pendiente' },
        { value: 'Terminado', label: 'Terminado' },
      ],
    },
    { key: 'vehicle', title: 'Vehículo', type: 'text' }, // For vehicle details
  ];

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFormStatus({ type: '', message: '' });
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
              if (key === 'fecha' && value[0] && value[1]) {
                const [startDate, endDate] = value as [Dayjs, Dayjs];
                params.append('fechaDesde', startDate.toISOString());
                params.append('fechaHasta', endDate.toISOString());
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

      const res = await fetch(`/api/services?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await res.json();
      setServices(data.data);
      setTotalPages(data.totalPages);
      setTotalServicesCount(data.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar servicios.');
      setFormStatus({
        type: 'error',
        message: err.message || 'Error al cargar servicios.',
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, activeFilters]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

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
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return;
    }
    setLoading(true);
    setFormStatus({ type: '', message: '' });
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar el servicio.');
      }
      setFormStatus({
        type: 'success',
        message: 'Servicio eliminado exitosamente.',
      });
      fetchServices(); // Re-fetch data after deletion
    } catch (err: any) {
      setFormStatus({
        type: 'error',
        message: err.message || 'Ocurrió un error al eliminar el servicio.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      {formStatus.type && (
        <Alert
          variant={formStatus.type === 'success' ? 'success' : 'error'}
          title={formStatus.type === 'success' ? 'Éxito' : 'Error'}
          description={formStatus.message}
        />
      )}

      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <AdvancedTableFilter
          columns={serviceColumns}
          onFilterChange={handleFilterChange}
          loading={loading}
          applyFiltersAutomatically={true}
        />
        <Link
          href="/fleet/services/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
          Crear Servicio
        </Link>
      </div>

      {loading ? (
        <p>Cargando servicios...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
                <TableHead
                  className="min-w-[155px] cursor-pointer xl:pl-7.5"
                  onClick={() => handleSort('tipoServicio')}
                >
                  Tipo de Servicio{' '}
                  {sortBy === 'tipoServicio' &&
                    (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('fecha')}
                >
                  Fecha{' '}
                  {sortBy === 'fecha' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('odometroInicial')}
                >
                  Odómetro Inicial{' '}
                  {sortBy === 'odometroInicial' &&
                    (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('odometroFinal')}
                >
                  Odómetro Final{' '}
                  {sortBy === 'odometroFinal' &&
                    (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('kilometrosRecorridos')}
                >
                  Km Recorridos{' '}
                  {sortBy === 'kilometrosRecorridos' &&
                    (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('estado')}
                >
                  Estado{' '}
                  {sortBy === 'estado' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead className="text-right xl:pr-7.5">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {services.map((service) => (
                <TableRow
                  key={service.id}
                  className="border-[#eee] dark:border-dark-3"
                >
                  <TableCell className="min-w-[155px] xl:pl-7.5">
                    <h5 className="text-dark dark:text-white">
                      {service.tipoServicio}
                    </h5>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {service.fecha
                        ? formatDate(
                            new Date(service.fecha).toLocaleDateString()
                          )
                        : 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {service.odometroInicial}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {service.odometroFinal || 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {service.kilometrosRecorridos}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        'max-w-fit rounded-full px-3.5 py-1 text-sm font-medium',
                        {
                          'bg-[#219653]/[0.08] text-[#219653]':
                            service.estado === 'Completado',
                          'bg-[#FFA70B]/[0.08] text-[#FFA70B]':
                            service.estado === 'Pendiente',
                        }
                      )}
                    >
                      {service.estado}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {service.vehicle
                        ? `${service.vehicle.marca} (${service.vehicle.matricula})`
                        : 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell className="xl:pr-7.5">
                    <div className="flex items-center justify-end gap-x-3.5">
                      <Link
                        href={`/fleet/services/${service.id}`}
                        className="hover:text-primary"
                      >
                        <span className="sr-only">Ver Servicio</span>
                        <PreviewIcon />
                      </Link>
                      <Link
                        href={`/fleet/services/${service.id}/edit`}
                        className="hover:text-primary"
                      >
                        <span className="sr-only">Editar Servicio</span>
                        <PencilSquareIcon />
                      </Link>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="hover:text-primary"
                      >
                        <span className="sr-only">Eliminar Servicio</span>
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
            total={totalServicesCount}
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

export default ServiceTable;
