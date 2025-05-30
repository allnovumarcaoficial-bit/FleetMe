'use client';

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Servicio, Vehicle } from '@/types/fleet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrashIcon, PencilSquareIcon } from "@/assets/icons";
import { PreviewIcon } from "@/components/Tables/icons";
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui-elements/alert';
import Link from 'next/link';

interface ServiceTableProps {
  vehicleId?: number; // Optional prop to filter services by vehicle
  vehicles: Vehicle[];
  loadingVehicles: boolean;
  errorVehicles: string | null;
  handleVehicleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const ServiceTable = ({ vehicleId, vehicles, loadingVehicles, errorVehicles, handleVehicleChange }: ServiceTableProps) => {
  const router = useRouter();
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState('desc');
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

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
      if (vehicleId) {
        params.append('vehicleId', vehicleId.toString());
      }
      const res = await fetch(`/api/services?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await res.json();
      setServices(data.data);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar servicios.');
      setFormStatus({ type: 'error', message: err.message || 'Error al cargar servicios.' });
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, vehicleId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

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
      setFormStatus({ type: 'success', message: 'Servicio eliminado exitosamente.' });
      fetchServices(); // Re-fetch data after deletion
    } catch (err: any) {
      setFormStatus({ type: 'error', message: err.message || 'Ocurrió un error al eliminar el servicio.' });
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

      <div className="mb-4 flex justify-between items-center">
        <div className="w-1/3">
          <label htmlFor="selectVehicle" className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
            Filtrar por Vehículo:
          </label>
          <select
            id="selectVehicle"
            name="selectVehicle"
            value={vehicleId || ''}
            onChange={handleVehicleChange}
            className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary [&>option]:text-dark-5 dark:[&>option]:text-dark-6"
          >
            <option value="">Todos los Vehículos</option>
            {loadingVehicles ? (
              <option disabled>Cargando vehículos...</option>
            ) : errorVehicles ? (
              <option disabled>Error al cargar vehículos</option>
            ) : (
              vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.marca} {vehicle.modelo} ({vehicle.matricula})
                </option>
              ))
            )}
          </select>
        </div>
        {!vehicleId && ( // Only show "Crear Servicio" button if not filtered by vehicle
          <Link href="/fleet/services/new" className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
            Crear Servicio
          </Link>
        )}
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
                <TableHead className="min-w-[155px] xl:pl-7.5 cursor-pointer" onClick={() => handleSort('tipoServicio')}>
                  Tipo de Servicio {sortBy === 'tipoServicio' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('fecha')}>
                  Fecha {sortBy === 'fecha' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('odometroInicial')}>
                  Odómetro Inicial {sortBy === 'odometroInicial' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('odometroFinal')}>
                  Odómetro Final {sortBy === 'odometroFinal' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('kilometrosRecorridos')}>
                  Km Recorridos {sortBy === 'kilometrosRecorridos' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('estado')}>
                  Estado {sortBy === 'estado' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead className="text-right xl:pr-7.5">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} className="border-[#eee] dark:border-dark-3">
                  <TableCell className="min-w-[155px] xl:pl-7.5">
                    <h5 className="text-dark dark:text-white">{service.tipoServicio}</h5>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {service.fecha ? new Date(service.fecha).toLocaleDateString() : 'N/A'}
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
                    <p className="text-dark dark:text-white">
                      {service.estado}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {service.vehicle ? `${service.vehicle.marca} (${service.vehicle.matricula})` : 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell className="xl:pr-7.5">
                    <div className="flex items-center justify-end gap-x-3.5">
                      <Link href={`/fleet/services/${service.id}`} className="hover:text-primary">
                        <span className="sr-only">Ver Servicio</span>
                        <PreviewIcon />
                      </Link>
                      <Link href={`/fleet/services/${service.id}/edit`} className="hover:text-primary">
                        <span className="sr-only">Editar Servicio</span>
                        <PencilSquareIcon />
                      </Link>
                      <button onClick={() => handleDelete(service.id)} className="hover:text-primary">
                        <span className="sr-only">Eliminar Servicio</span>
                        <TrashIcon />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-5 flex justify-between items-center">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
              className="inline-flex items-center justify-center rounded-md border border-stroke bg-gray-2 py-2 px-4 text-center font-medium text-dark hover:bg-opacity-90 dark:border-dark-3 dark:bg-dark-2 dark:text-white disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-dark dark:text-white">Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || loading}
              className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceTable;
