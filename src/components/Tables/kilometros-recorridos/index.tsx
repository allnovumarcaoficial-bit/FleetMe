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
import { getKilometrosRecorridos } from '@/lib/actions/actions';
import { ExportKM } from './exportKM';

export interface KilometrosRecorridosData {
  id: number;
  matricula: string;
  odometro: number | null;
  createdAt: Date;
  km_recorrido: number;
  gasto_mantenimientos: number;
  liters: number;
}

export async function KilometrosRecorridosTable({
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
  const data = await getKilometrosRecorridos(date);

  if (!Array.isArray(data)) {
    return <div>Error al cargar los vehículos</div>;
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
          Kilómetros Recorridos
        </h2>

        <PeriodPicker
          items={months}
          defaultValue={selectedMonth}
          sectionKey="kilometros_recorridos"
        />
      </div>

      <div className="mb-4 mt-2">
        <ExportKM data={data} />
      </div>
      {/* Contenedor responsive con scroll horizontal */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <Table className="min-w-full">
          <TableHeader className="bg-gray-50 dark:bg-gray-800">
            <TableRow className="border-b border-gray-200 dark:border-gray-700">
              <TableHead className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Matrícula
              </TableHead>
              <TableHead className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Odómetro
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Kilómetros Recorridos
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Costo del mantenimiento
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                Litros Echados
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((vh) => (
              <TableRow
                key={vh.id}
                className="border-b border-gray-100 last:border-0 dark:border-gray-800"
              >
                <TableCell className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white sm:px-6">
                  {vh.matricula}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 sm:px-6">
                  {vh.odometro}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400 sm:px-6">
                  {vh.km_recorrido.toFixed(2)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400 sm:px-6">
                  {vh.gasto_mantenimientos.toFixed(2)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400 sm:px-6">
                  {vh.liters.toFixed(2)}
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
