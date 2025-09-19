'use client';

import { useState, useEffect, useCallback } from 'react';
import { FuelCard, Reservorio, TipoCombustible } from '@/types/fleet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui-elements/alert';
import Link from 'next/link';
import Pagination from '@/components/Tables/Pagination';
import AdvancedTableFilter, {
  ColumnFilter,
  ActiveFilters,
} from '../PageElements/AdvancedTableFilter';
import { formatDate } from 'date-fns';
import { PreviewIcon } from '@/components/Tables/icons';
import { PencilSquareIcon, TrashIcon } from '@/assets/icons';
import { MenuDropDowndTable } from '@/components/Charts/chartDownload';
import * as XLSX from 'xlsx';

const DieselTypeTable = () => {
  const router = useRouter();
  const [tipoCombustible, setTipoCombustible] = useState<TipoCombustible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalreservorioCount, setTotalreservorioCount] = useState(0);
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });

  const fuelCardColumns: ColumnFilter[] = [
    { key: 'nombre', title: 'Nombre', type: 'text' },
    {
      key: 'precio',
      title: 'Precio',
      type: 'text',
    },
    { key: 'fecha_update', title: 'Última Actualización', type: 'dateRange' },
    {
      key: 'moneda',
      title: 'Moneda',
      type: 'select',
      options: [
        { value: 'USD', label: 'USD' },
        { value: 'CUP', label: 'CUP' },
        { value: 'MLC', label: 'MLC' },
      ],
    },
  ];

  const fetchDieselType = useCallback(async () => {
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

      //   if (activeFilters.columnFilters) {
      //     for (const key in activeFilters.columnFilters) {
      //       const value = activeFilters.columnFilters[key];
      //       if (value !== undefined && value !== null && value !== "") {
      //         if (Array.isArray(value)) {
      //           if (key === "fechaVencimiento" && value[0] && value[1]) {
      //             const [startDate, endDate] = value as [Dayjs, Dayjs];
      //             params.append("fechaVencimientoDesde", startDate.toISOString());
      //             params.append("fechaVencimientoHasta", endDate.toISOString());
      //           } else if (value.length > 0) {
      //             params.append(key, value.join(","));
      //           }
      //         } else if (typeof value === "boolean") {
      //           params.append(key, value.toString());
      //         } else {
      //           params.append(key, value.toString());
      //         }
      //       }
      //     }
      //   }

      const res = await fetch(`/api/dieselType?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch fuel cards');
      }
      const data = await res.json();
      setTipoCombustible(data.data);
      setTotalPages(data.totalPages);
      setTotalreservorioCount(data.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el tipo de combustible.');
      setFormStatus({
        type: 'error',
        message: err.message || 'Error al cargar el tipo de combustible.',
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, activeFilters]);

  useEffect(() => {
    fetchDieselType();
  }, [fetchDieselType]);

  const handleFilterChange = useCallback((filters: ActiveFilters) => {
    setActiveFilters(filters);
    setPage(1); // Reset to first page on filter change
  }, []);

  useEffect(() => {
    fetchDieselType();
  }, [fetchDieselType]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        '¿Estás seguro de que quieres eliminar este tipo de combustible?'
      )
    ) {
      return;
    }
    setLoading(true);
    setFormStatus({ type: '', message: '' });
    try {
      const res = await fetch(`/api/dieselType/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || 'Error al eliminar el tipo de combustible.'
        );
      }
      setFormStatus({
        type: 'success',
        message: 'Tipo de combustible eliminado exitosamente.',
      });
      fetchDieselType(); // Re-fetch data after deletion
    } catch (err: any) {
      setFormStatus({
        type: 'error',
        message:
          err.message || 'Ocurrió un error al eliminar el Tipo de combustible.',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();

    // Preparar los datos en el formato correcto
    const datosFormateados = tipoCombustible.map((item) => ({
      'Nombre de Tipo de combustible': item.nombre,
      Precio: item.precio,
      'Última Actualización': new Date(item.fechaUpdate).toLocaleDateString(
        'es-ES'
      ),
      Moneda: item.moneda,
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
    XLSX.utils.book_append_sheet(wb, ws, 'Tipos de Combustible');

    // Escribir el archivo y forzar la descarga
    XLSX.writeFile(wb, 'tipos_de_combustible.xlsx');
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
          columns={fuelCardColumns}
          onFilterChange={handleFilterChange}
          loading={loading}
          applyFiltersAutomatically={true}
        />
        <Link
          href="/fleet/desielType/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
          Crear Tipo de combustible
        </Link>
      </div>

      {loading ? (
        <p>Cargando Tipo de combustible...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="mx-auto flex justify-end">
            <MenuDropDowndTable exportToExcel={exportToExcel} />
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#F7F9FC] text-center dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
                <TableHead
                  className="cursor-pointer text-center xl:pl-7.5"
                  onClick={() => handleSort('nombre')}
                >
                  Nombre del Tipo de combustible{' '}
                  {sortBy === 'nombre' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer text-center"
                  onClick={() => handleSort('precio')}
                >
                  Precio{' '}
                  {sortBy === 'precio' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="min-w-[155px] cursor-pointer text-center xl:pl-7.5"
                  onClick={() => handleSort('fecha_update')}
                >
                  Última Actualización{' '}
                  {sortBy === 'fecha_update' &&
                    (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer text-center"
                  onClick={() => handleSort('moneda')}
                >
                  Moneda{' '}
                  {sortBy === 'moneda' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead className="text-center xl:pr-7.5">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {tipoCombustible.map((tipo) => (
                <TableRow
                  key={tipo.id}
                  className="border-[#eee] dark:border-dark-3"
                >
                  <TableCell className="min-w-[155px] text-center xl:pl-7.5">
                    <h5 className="text-center text-dark dark:text-white">
                      {tipo.nombre}
                    </h5>
                  </TableCell>
                  <TableCell className="text-center">
                    <p className="text-center text-dark dark:text-white">
                      {tipo.precio}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <p className="text-center text-dark dark:text-white">
                      {tipo.fechaUpdate
                        ? formatDate(
                            new Date(tipo.fechaUpdate).toISOString(),
                            'dd/MM/yyyy'
                          )
                        : 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <p className="text-center text-dark dark:text-white">
                      {tipo.moneda}
                    </p>
                  </TableCell>
                  <TableCell className="text-center xl:pr-7.5">
                    <div className="flex items-center justify-center gap-x-3.5">
                      <Link
                        href={`/fleet/desielType/${tipo.id}`}
                        className="hover:text-primary"
                      >
                        <span className="sr-only">Ver Tipo de Combustible</span>
                        <PreviewIcon />
                      </Link>
                      <Link
                        href={`/fleet/desielType/${tipo.id}/edit`}
                        className="hover:text-primary"
                      >
                        <span className="sr-only">Editar Conductor</span>
                        <PencilSquareIcon />
                      </Link>
                      <button
                        onClick={() => handleDelete(tipo.id.toString())}
                        className="hover:text-primary"
                      >
                        <span className="sr-only">
                          Eliminar Tipo de Combustible
                        </span>
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
            total={totalreservorioCount}
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

export default DieselTypeTable;
