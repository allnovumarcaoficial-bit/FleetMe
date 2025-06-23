'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useEffect, useState } from "react";
import { VehicleType } from "@/types/fleet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TrashIcon, PencilSquareIcon } from "@/assets/icons";
import { PreviewIcon } from "@/components/Tables/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

const VehicleTypesPage = () => {
  const router = useRouter();
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalVehicleTypes, setTotalVehicleTypes] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });


  const fetchVehicleTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/vehicle-types?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setVehicleTypes(result.data);
      setTotalVehicleTypes(result.total);
      setTotalPages(result.totalPages);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
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
    if (window.confirm('¿Estás seguro de que quieres eliminar este tipo de vehículo?')) {
      setActionStatus({ type: '', message: '' });
      try {
        const response = await fetch(`/api/vehicle-types/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al eliminar el tipo de vehículo.');
        }
        setActionStatus({ type: 'success', message: 'Tipo de vehículo eliminado exitosamente.' });
        fetchVehicleTypes(); // Re-fetch vehicle types after deletion
      } catch (e: any) {
        setActionStatus({ type: 'error', message: e.message || 'Ocurrió un error al eliminar el tipo de vehículo.' });
      }
    }
  };

  if (loading) return <p>Cargando tipos de vehículos...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <>
      <Breadcrumb
        pageName="Tipos de Vehículos"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/vehicle-types", label: "Tipos de Vehículos" }
        ]}
      />


      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Buscar tipos de vehículos..."
            value={search}
            onChange={handleSearchChange}
            className="w-1/3 rounded border border-stroke bg-gray py-2 px-4 text-black focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
          <Link href="/fleet/vehicle-types/new">
            <button className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
              Crear Tipo de Vehículo
            </button>
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
              <TableHead className="min-w-[155px] xl:pl-7.5 cursor-pointer" onClick={() => handleSort('nombre')}>
                Nombre {sortBy === 'nombre' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('cantidad_neumaticos')}>
                Neumáticos {sortBy === 'cantidad_neumaticos' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('tipo_neumaticos')}>
                Tipo Neumáticos {sortBy === 'tipo_neumaticos' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('es_electrico')}>
                Eléctrico {sortBy === 'es_electrico' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead className="text-right xl:pr-7.5">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {vehicleTypes.map((type) => (
              <TableRow key={type.id} className="border-[#eee] dark:border-dark-3">
                <TableCell className="min-w-[155px] xl:pl-7.5">
                  <h5 className="text-dark dark:text-white">{type.nombre}</h5>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{type.cantidad_neumaticos}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{type.tipo_neumaticos}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{type.es_electrico ? 'Sí' : 'No'}</p>
                </TableCell>
                <TableCell className="xl:pr-7.5">
                  <div className="flex items-center justify-end gap-x-3.5">
                    <Link href={`/fleet/vehicle-types/${type.id}`} className="hover:text-primary">
                      <span className="sr-only">Ver Tipo</span>
                      <PreviewIcon />
                    </Link>
                    <Link href={`/fleet/vehicle-types/${type.id}/edit`} className="hover:text-primary">
                      <span className="sr-only">Editar Tipo</span>
                      <PencilSquareIcon />
                    </Link>
                    <button onClick={() => handleDelete(type.id)} className="hover:text-primary">
                      <span className="sr-only">Eliminar Tipo</span>
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

export default VehicleTypesPage;
