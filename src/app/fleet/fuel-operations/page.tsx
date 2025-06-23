'use client';

import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import { FuelOperation, FuelCard, Vehicle } from '@/types/fleet'; // Assuming FuelOperation, FuelCard, Vehicle types are in fleet.ts
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrashIcon, PencilSquareIcon } from '@/assets/icons';
import { PreviewIcon } from '@/components/Tables/icons'; // Re-using PreviewIcon
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs'; // For date formatting
import Pagination from "@/components/Tables/Pagination";

const FuelOperationsPage = () => {
  const router = useRouter();
  const [fuelOperations, setFuelOperations] = useState<(FuelOperation & { fuelCard: FuelCard; vehicle: Vehicle | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalFuelOperations, setTotalFuelOperations] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [orderBy, setOrderBy] = useState('fecha');
  const [orderDirection, setOrderDirection] = useState('desc');
  const [search, setSearch] = useState('');
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

  const fetchFuelOperations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/fuel-operations?page=${page}&limit=${limit}&orderBy=${orderBy}&orderDirection=${orderDirection}&search=${search}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setFuelOperations(result.data);
      setTotalFuelOperations(result.total);
      setTotalPages(Math.ceil(result.total / limit)); // Calculate totalPages
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelOperations();
  }, [page, limit, orderBy, orderDirection, search]);


  const handleSort = (column: string) => {
    if (orderBy === column) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(column);
      setOrderDirection('asc');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta operación de combustible?')) {
      setActionStatus({ type: '', message: '' });
      try {
        const response = await fetch(`/api/fuel-operations/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al eliminar la operación de combustible.');
        }
        setActionStatus({ type: 'success', message: 'Operación de combustible eliminada exitosamente.' });
        fetchFuelOperations(); // Re-fetch operations after deletion
      } catch (e: any) {
        setActionStatus({ type: 'error', message: e.message || 'Ocurrió un error al eliminar la operación de combustible.' });
      }
    }
  };

  if (loading) return <p>Cargando operaciones de combustible...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <>
      <Breadcrumbs
        pageName="Operaciones de Combustible"
        links={[
          { href: '/fleet', label: 'Flota' },
          { href: '/fleet/fuel-operations', label: 'Operaciones de Combustible' },
        ]}
      />


      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Buscar operaciones..."
            value={search}
            onChange={handleSearchChange}
            className="w-1/3 rounded border border-stroke bg-gray py-2 px-4 text-black focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
          <Link href="/fleet/fuel-operations/new">
            <button className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
              Crear Operación
            </button>
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
              <TableHead className="min-w-[155px] xl:pl-7.5 cursor-pointer" onClick={() => handleSort('tipoOperacion')}>
                Tipo de Operación {orderBy === 'tipoOperacion' && (orderDirection === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('fecha')}>
                Fecha {orderBy === 'fecha' && (orderDirection === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('fuelCard.numeroDeTarjeta')}>
                Tarjeta {orderBy === 'fuelCard.numeroDeTarjeta' && (orderDirection === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead>Saldo Inicio</TableHead>
              <TableHead>Valor Dinero</TableHead>
              <TableHead>Valor Litros</TableHead>
              <TableHead>Saldo Final</TableHead>
              <TableHead>Saldo Final Litros</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('vehicle.matricula')}>
                Vehículo Destino {orderBy === 'vehicle.matricula' && (orderDirection === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead className="text-right xl:pr-7.5">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {fuelOperations.map((operation) => (
              <TableRow key={operation.id} className="border-[#eee] dark:border-dark-3">
                <TableCell className="min-w-[155px] xl:pl-7.5">
                  <h5 className="text-dark dark:text-white">{operation.tipoOperacion}</h5>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{dayjs(operation.fecha).format('DD/MM/YYYY HH:mm')}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{operation.fuelCard.numeroDeTarjeta}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{operation.saldoInicio.toFixed(2)}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{operation.valorOperacionDinero.toFixed(2)}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{operation.valorOperacionLitros.toFixed(2)}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{operation.saldoFinal.toFixed(2)}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{operation.saldoFinalLitros.toFixed(2)}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{operation.vehicle?.matricula || 'N/A'}</p>
                </TableCell>
                <TableCell className="xl:pr-7.5">
                  <div className="flex items-center justify-end gap-x-3.5">
                    <Link href={`/fleet/fuel-operations/${operation.id}`} className="hover:text-primary">
                      <span className="sr-only">Ver Operación</span>
                      <PreviewIcon />
                    </Link>
                    <Link href={`/fleet/fuel-operations/${operation.id}/edit`} className="hover:text-primary">
                      <span className="sr-only">Editar Operación</span>
                      <PencilSquareIcon />
                    </Link>
                    <button onClick={() => handleDelete(operation.id)} className="hover:text-primary">
                      <span className="sr-only">Eliminar Operación</span>
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
          total={totalFuelOperations}
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
      </div>
    </>
  );
};

export default FuelOperationsPage;
