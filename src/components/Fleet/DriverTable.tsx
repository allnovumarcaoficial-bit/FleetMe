'use client';

import { useState, useEffect, useCallback } from 'react';
import { Driver } from '@/types/fleet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrashIcon, PencilSquareIcon } from "@/assets/icons";
import { PreviewIcon } from "@/components/Tables/icons"; // Reusing existing icons
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui-elements/alert';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Import cn for conditional styling
import { DriverStatus } from '@/types/fleet'; // Import DriverStatus

interface DriverTableProps { }

const DriverTable = ({ }: DriverTableProps) => {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFormStatus({ type: '', message: '' });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        search,
      });
      const res = await fetch(`/api/drivers?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch drivers');
      }
      const data = await res.json();
      setDrivers(data.data);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar conductores.');
      setFormStatus({ type: 'error', message: err.message || 'Error al cargar conductores.' });
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, search]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este conductor?')) {
      return;
    }
    setLoading(true);
    setFormStatus({ type: '', message: '' });
    try {
      const res = await fetch(`/api/drivers/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar el conductor.');
      }
      setFormStatus({ type: 'success', message: 'Conductor eliminado exitosamente.' });
      fetchDrivers(); // Re-fetch data after deletion
    } catch (err: any) {
      setFormStatus({ type: 'error', message: err.message || 'Ocurrió un error al eliminar el conductor.' });
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
        <input
          type="text"
          placeholder="Buscar conductor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3 rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
        />
        <Link href="/fleet/drivers/new" className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
          Crear Conductor
        </Link>
      </div>

      {loading ? (
        <p>Cargando conductores...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
                <TableHead className="min-w-[155px] xl:pl-7.5 cursor-pointer" onClick={() => handleSort('nombre')}>
                  Nombre {sortBy === 'nombre' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('licencia')}>
                  Licencia {sortBy === 'licencia' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('fecha_vencimiento_licencia')}>
                  Vencimiento Licencia {sortBy === 'fecha_vencimiento_licencia' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('carnet_peritage')}>
                  Carnet Peritaje {sortBy === 'carnet_peritage' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('estado')}>
                  Estado {sortBy === 'estado' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead>Vehículo Asignado</TableHead>
                <TableHead className="text-right xl:pr-7.5">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id} className="border-[#eee] dark:border-dark-3">
                  <TableCell className="min-w-[155px] xl:pl-7.5">
                    <h5 className="text-dark dark:text-white">{driver.nombre}</h5>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">{driver.licencia}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {driver.fecha_vencimiento_licencia ? new Date(driver.fecha_vencimiento_licencia).toLocaleDateString() : 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {driver.carnet_peritage ? 'Sí' : 'No'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        "max-w-fit rounded-full px-3.5 py-1 text-sm font-medium",
                        {
                          "bg-[#219653]/[0.08] text-[#219653]":
                            driver.estado === "Activo",
                          "bg-[#D34053]/[0.08] text-[#D34053]":
                            driver.estado === "Inactivo",
                          "bg-[#FFA70B]/[0.08] text-[#FFA70B]":
                            driver.estado === "Vacaciones",
                        },
                      )}
                    >
                      {driver.estado}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {driver.vehicle ? `${driver.vehicle.marca} ${driver.vehicle.modelo} (${driver.vehicle.matricula})` : 'Ninguno'}
                    </p>
                  </TableCell>
                  <TableCell className="xl:pr-7.5">
                    <div className="flex items-center justify-end gap-x-3.5">
                      <Link href={`/fleet/drivers/${driver.id}`} className="hover:text-primary">
                        <span className="sr-only">Ver Conductor</span>
                        <PreviewIcon />
                      </Link>
                      <Link href={`/fleet/drivers/${driver.id}/edit`} className="hover:text-primary">
                        <span className="sr-only">Editar Conductor</span>
                        <PencilSquareIcon />
                      </Link>
                      <button onClick={() => handleDelete(driver.id)} className="hover:text-primary">
                        <span className="sr-only">Eliminar Conductor</span>
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

export default DriverTable;
