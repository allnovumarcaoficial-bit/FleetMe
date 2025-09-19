import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, getDateByMonth } from '@/lib/utils';
import { PeriodPicker } from '@/components/period-picker';
import {
  getKilometrosRecorridos,
  getMantenimientosTable,
} from '@/lib/actions/actions';
import { formatDate } from 'date-fns';
import { ExportMantenimiento } from './exportMantenimiento';

export interface MantenimientoData {
  id: number;
  tipo: string;
  fecha: Date;
  costo: number;
  descripcion: string;
  lista_de_piezas: string;
  cambio_de_pieza: boolean;
  estado: string;
  numero_serie_anterior: string | null;
  numero_serie_nueva: string | null;
  vehicle: {
    matricula: string;
    km_recorrido: number;
    odometro: number | null;
  } | null;
}
export async function HistorialMantenimientoTable({
  className,
  timeframe,
  searchParams,
}: {
  className?: string;
  timeframe?: string;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const date = getDateByMonth(timeframe || months[new Date().getMonth()]);
  const data = await getMantenimientosTable(date);
  const totalgastado = data.reduce((total, mantenimiento) => {
    return total + mantenimiento.costo;
  }, 0);

  if (!Array.isArray(data)) {
    return <div>Error al cargar los mantenimientos</div>;
  }

  const selectedMonthParam = timeframe || 'agosto';
  let selectedMonth = months[new Date().getMonth()];

  if (selectedMonthParam && typeof selectedMonthParam === 'string') {
    const parts = selectedMonthParam.split(':');
    if (parts[0].length > 1) {
      const monthFromParams = parts[0];
      if (months.includes(monthFromParams)) {
        selectedMonth = monthFromParams;
      }
    }
  }

  return (
    <div
      className={cn(
        'rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card sm:p-6',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-dark dark:text-white sm:text-xl">
          Historial de Mantenimientos
        </h2>

        <PeriodPicker
          items={months}
          defaultValue={selectedMonth}
          sectionKey="historial_mantenimientos"
        />
      </div>

      {/* Contenedor responsive con scroll horizontal */}
      <div className="flex flex-1 flex-wrap">
        <h1 className="text-xl">Total Gastado: </h1>
        <p className="px-1 text-lg text-green-600 dark:text-green-400">
          {totalgastado.toFixed(2)}
        </p>
      </div>
      <div className="mb-4 mt-2">
        <ExportMantenimiento data={data} />
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <Table className="min-w-full">
          <TableHeader className="bg-gray-50 dark:bg-gray-800">
            <TableRow className="border-b border-gray-200 dark:border-gray-700">
              <TableHead className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Fecha
              </TableHead>
              <TableHead className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Matricula
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Descripción del servicio
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Kilometraje
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Costo
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Estado
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Cambio de Piezas
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Lista de Piezas
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Número de serie anterior
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Número de serie nuevo
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Tipo de mantenimiento
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((mantenimiento) => (
              <TableRow
                key={mantenimiento.id}
                className="border-b border-gray-100 last:border-0 dark:border-gray-800"
              >
                <TableCell className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white sm:px-6">
                  {formatDate(mantenimiento.fecha, 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 sm:px-6">
                  {mantenimiento.vehicle?.matricula}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400 sm:px-6">
                  {mantenimiento.descripcion}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400 sm:px-6">
                  {mantenimiento.vehicle?.km_recorrido.toFixed(2)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400 sm:px-6">
                  {mantenimiento.costo.toFixed(2)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400 sm:px-6">
                  {mantenimiento.estado}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400 sm:px-6">
                  {mantenimiento.cambio_de_pieza ? 'Sí' : 'No'}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400 sm:px-6">
                  {JSON.parse(mantenimiento.lista_de_piezas).map(
                    (pieza: any, index: any) => (
                      <div key={index} className="pieza-item">
                        <strong>Name:</strong> {pieza.name}
                        <br />
                        <strong>Serie Anterior:</strong>{' '}
                        {pieza.numero_serie_anterior || 'N/A'}
                        <br />
                        <strong>Serie Nueva:</strong>{' '}
                        {pieza.numero_serie_nueva || 'N/A'}
                        <hr />
                      </div>
                    )
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400 sm:px-6">
                  {mantenimiento.numero_serie_anterior || 'N/A'}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400 sm:px-6">
                  {mantenimiento.numero_serie_nueva || 'N/A'}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400 sm:px-6">
                  {mantenimiento.tipo}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data.length === 0 && (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          No hay datos disponibles para el mes seleccionado
        </div>
      )}
    </div>
  );
}
