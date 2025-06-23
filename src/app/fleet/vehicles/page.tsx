'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useEffect, useState } from "react";
import { Vehicle } from "@/types/fleet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TrashIcon, PencilSquareIcon } from "@/assets/icons";
import { PreviewIcon } from "@/components/Tables/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

const VehiclesPage = () => {
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
  const [search, setSearch] = useState('');
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });


  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/vehicles?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}`
      );
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
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, limit, sortBy, sortOrder, search]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      setActionStatus({ type: '', message: '' });
      try {
        const response = await fetch(`/api/vehicles/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al eliminar el vehículo.');
        }
        setActionStatus({ type: 'success', message: 'Vehículo eliminado exitosamente.' });
        fetchVehicles(); // Re-fetch vehicles after deletion
      } catch (e: any) {
        setActionStatus({ type: 'error', message: e.message || 'Ocurrió un error al eliminar el vehículo.' });
      }
    }
  };

  if (loading) return <p>Cargando vehículos...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <>
      <Breadcrumb
        pageName="Vehículos"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/vehicles", label: "Vehículos" }
        ]}
      />


      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Buscar vehículos..."
            value={search}
            onChange={handleSearchChange}
            className="w-1/3 rounded border border-stroke bg-gray py-2 px-4 text-black focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
          <Link href="/fleet/vehicles/new">
            <button className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
              Crear Vehículo
            </button>
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
              <TableHead className="min-w-[155px] xl:pl-7.5 cursor-pointer" onClick={() => handleSort('marca')}>
                Marca {sortBy === 'marca' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('modelo')}>
                Modelo {sortBy === 'modelo' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('vin')}>
                VIN {sortBy === 'vin' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('matricula')}>
                Matrícula {sortBy === 'matricula' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('estado')}>
                Estado {sortBy === 'estado' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead className="text-right xl:pr-7.5">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id} className="border-[#eee] dark:border-dark-3">
                <TableCell className="min-w-[155px] xl:pl-7.5">
                  <h5 className="text-dark dark:text-white">{vehicle.marca}</h5>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{vehicle.modelo}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{vehicle.vin}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{vehicle.matricula}</p>
                </TableCell>
                <TableCell>
                  <div
                  className={cn(
                    "max-w-fit rounded-full px-3.5 py-1 text-sm font-medium",
                    {
                      "bg-[#219653]/[0.08] text-[#219653]":
                        vehicle.estado === "Activo",
                      "bg-[#D34053]/[0.08] text-[#D34053]":
                        vehicle.estado === "Inactivo",
                      "bg-[#FFA70B]/[0.08] text-[#FFA70B]":
                        vehicle.estado === "En Mantenimiento",
                    },
                  )}
                >
                  {vehicle.estado}
                </div>
                </TableCell>
                <TableCell className="xl:pr-7.5">
                  <div className="flex items-center justify-end gap-x-3.5">
                    <Link href={`/fleet/vehicles/${vehicle.id}`} className="hover:text-primary">
                      <span className="sr-only">Ver Vehículo</span>
                      <PreviewIcon />
                    </Link>
                    <Link href={`/fleet/vehicles/${vehicle.id}/edit`} className="hover:text-primary">
                      <span className="sr-only">Editar Vehículo</span>
                      <PencilSquareIcon />
                    </Link>
                    <button onClick={() => handleDelete(vehicle.id)} className="hover:text-primary">
                      <span className="sr-only">Eliminar Vehículo</span>
                      <TrashIcon />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="rounded-md bg-gray-2 px-4 py-2 text-dark dark:bg-dark-2 dark:text-white disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-dark dark:text-white">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="rounded-md bg-gray-2 px-4 py-2 text-dark dark:bg-dark-2 dark:text-white disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
};

export default VehiclesPage;
