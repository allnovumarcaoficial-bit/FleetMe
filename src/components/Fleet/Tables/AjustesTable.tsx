'use client';

import { useEffect, useState, useCallback } from 'react';
import { Ajuste, FuelCard, TipoAjuste } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import Pagination from '@/components/Tables/Pagination';
import AdvancedTableFilter, {
  ColumnFilter,
  ActiveFilters,
} from '../PageElements/AdvancedTableFilter';
import { Alert } from '@/components/ui-elements/alert';
import { MenuDropDowndTable } from '@/components/Charts/chartDownload';
import * as XLSX from 'xlsx';

interface AjustesTableProps {
  ajustes: (Ajuste & { tarjeta: FuelCard })[];
}

export const AjustesTable = () => {
  const router = useRouter();
  const [ajustes, setAjustes] = useState<
    (Ajuste & {
      tarjeta: FuelCard;
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalAjustes, setTotalAjustes] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [actionStatus, setActionStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });

  const ajusteColumns: ColumnFilter[] = [
    { key: 'tarjeta.numeroDeTarjeta', title: 'Tarjeta', type: 'text' },
    {
      key: 'tipoOperacion',
      title: 'Tipo de Operación',
      type: 'select',
      options: [
        { value: TipoAjuste.CREDITO, label: 'Crédito' },
        { value: TipoAjuste.DEBITO, label: 'Débito' },
      ],
    },
    { key: 'valorOperacion', title: 'Valor', type: 'text' },
    { key: 'descripcion', title: 'Descripción', type: 'text' },
    { key: 'createdAt', title: 'Fecha', type: 'dateRange' },
  ];

  const fetchAjustes = useCallback(async () => {
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
              if (key === 'createdAt' && value[0] && value[1]) {
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

      const response = await fetch(`/api/ajustes?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setAjustes(result); // La API de ajustes devuelve directamente el array
      setTotalAjustes(result.length); // Ajustar esto si la API devuelve total
      setTotalPages(Math.ceil(result.length / limit)); // Ajustar esto si la API devuelve total
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, activeFilters]);

  useEffect(() => {
    fetchAjustes();
  }, [fetchAjustes]);

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

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const datosFormateados = ajustes.map((item) => ({
      Tarjeta: item.tarjeta.numeroDeTarjeta,
      'Tipo de Operación': item.tipoOperacion,
      Valor: item.valorOperacion,
      Descripción: item.descripcion,
      Fecha: dayjs(item.createdAt).format('DD/MM/YYYY HH:mm'),
    }));

    const ws = XLSX.utils.json_to_sheet(datosFormateados);
    const columnWidths = [
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 40 },
      { wch: 20 },
    ];
    ws['!cols'] = columnWidths;
    XLSX.utils.book_append_sheet(wb, ws, 'Ajustes');
    XLSX.writeFile(wb, 'Ajustes.xlsx');
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
          columns={ajusteColumns}
          onFilterChange={handleFilterChange}
          loading={loading}
          applyFiltersAutomatically={true}
        />
        <Link href="/ajustes/new">
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
            Crear Ajuste
          </button>
        </Link>
      </div>

      {loading ? (
        <p>Cargando ajustes...</p>
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
                  onClick={() => handleSort('tarjeta.numeroDeTarjeta')}
                >
                  Tarjeta{' '}
                  {sortBy === 'tarjeta.numeroDeTarjeta' &&
                    (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('tipoOperacion')}
                >
                  Tipo de Operación{' '}
                  {sortBy === 'tipoOperacion' &&
                    (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('valorOperacion')}
                >
                  Valor{' '}
                  {sortBy === 'valorOperacion' &&
                    (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('descripcion')}
                >
                  Descripción{' '}
                  {sortBy === 'descripcion' &&
                    (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  Fecha{' '}
                  {sortBy === 'createdAt' && (sortOrder === 'asc' ? '▲' : '▼')}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {ajustes.map((ajuste) => (
                <TableRow
                  key={ajuste.id}
                  className="border-[#eee] dark:border-dark-3"
                >
                  <TableCell className="min-w-[155px] xl:pl-7.5">
                    <h5 className="text-dark dark:text-white">
                      {ajuste.tarjeta.numeroDeTarjeta}
                    </h5>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {ajuste.tipoOperacion}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {ajuste.valorOperacion.toFixed(2)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {ajuste.descripcion}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {dayjs(ajuste.createdAt).format('DD/MM/YYYY HH:mm')}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            current={page}
            total={totalAjustes}
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
