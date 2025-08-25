export interface ChipCombustibleData {
  id: number;
  tipoOperacion: OperationTipo;
  fecha: Date;
  saldoInicio: number;
  valorOperacionLitros: number;
  saldoFinal: number;
  tipoCombustible_id: number;
  tipoCombustible: TipoCombustible;
}
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { compactFormat, standardFormat } from '@/lib/format-number';
import { cn, formatDate, getDateByMonth, getMonthName } from '@/lib/utils';
import Image from 'next/image';
import { getTopChannels } from '../fetch';
import { PeriodPicker } from '@/components/period-picker';
import { getChipFuel, getKilometrosRecorridos } from '@/lib/actions/actions';
import { OperationTipo, TipoCombustible } from '@/types/fleet';

export async function KilometrosRecorridosTable({
  className,
  timeframe,
}: {
  className?: string;
  timeframe?: string;
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
    // Manejar el error en UI
    return <div>Error al cargar los vehículos</div>;
  }

  return (
    <div
      className={cn(
        'grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
          Kilómetros Recorridos
        </h2>
        <PeriodPicker
          items={months}
          defaultValue={months[new Date().getMonth()]}
          sectionKey="kilometros_recorridos"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-none uppercase [&>th]:text-center">
            <TableHead className="min-w-[120px] !text-left">
              Matrícula
            </TableHead>
            <TableHead>Odómetro</TableHead>
            <TableHead className="!text-right">Kilómetros Recorridos</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((vh, i) => (
            <TableRow
              className="text-center text-base font-medium text-dark dark:text-white"
              key={vh.id}
            >
              <TableCell className="flex min-w-fit items-center gap-3">
                <div className="">{vh.matricula}</div>
              </TableCell>

              <TableCell>{vh.odometro}</TableCell>

              <TableCell className="!text-right text-green-light-1">
                {vh.km_recorrido.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
