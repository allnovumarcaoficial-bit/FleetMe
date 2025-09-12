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
import { cn, getDateByMonth, getMonthName } from '@/lib/utils';
import Image from 'next/image';
import { getTopChannels } from '../fetch';
import { PeriodPicker } from '@/components/period-picker';
import { getChipFuel } from '@/lib/actions/actions';
import { OperationTipo, TipoCombustible } from '@/types/fleet';
import { formatDate } from 'date-fns';

export async function ChipsCombustible({
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
  const date = getDateByMonth(timeframe || '');
  const data = await getChipFuel(date);
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
          Chips de combustible
        </h2>
        <PeriodPicker
          items={months}
          defaultValue={months[new Date().getMonth()]}
          sectionKey="chips-combustible"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-none uppercase [&>th]:text-center">
            <TableHead className="min-w-[120px] !text-left">Fecha</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead className="!text-right">Operación</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Litros</TableHead>
            <TableHead>Saldo</TableHead>
            <TableHead>Saldo Final</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((chip, i) => (
            <TableRow
              className="text-center text-base font-medium text-dark dark:text-white"
              key={chip.id}
            >
              <TableCell className="flex min-w-fit items-center gap-3">
                <div className="">{formatDate(chip.fecha, 'dd/MM/yyyy')}</div>
              </TableCell>

              <TableCell>{chip.fecha.getTime()}</TableCell>

              <TableCell className="!text-right text-green-light-1">
                {chip.tipoOperacion}
              </TableCell>

              <TableCell>{chip.tipoCombustible?.nombre || ''}</TableCell>

              <TableCell>{chip.valorOperacionLitros}%</TableCell>
              <TableCell>{chip.saldoInicio}%</TableCell>
              <TableCell>{chip.saldoFinal}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
