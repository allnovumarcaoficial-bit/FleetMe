import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, getDateByMonth, getMonthName } from '@/lib/utils';
import { PeriodPicker } from '@/components/period-picker';
import {
  getChipFuel,
  getChipFuelTotal,
  getFuelCardData,
} from '@/lib/actions/actions';
import { OperationTipo, TipoCombustible } from '@/types/fleet';
import { formatDate } from 'date-fns';
import { ExportChipCombustible } from './exportChip';

export interface ChipCombustibleData {
  id: number;
  tipoOperacion: string;
  fecha: Date;
  saldoInicio: number | null;
  valorOperacionLitros: number | null;
  saldoFinal: number | null;
  tipoCombustible_id: number | null;
  tipoCombustible: TipoCombustible | null;
  descripcion: string | null;
}
export async function ChipsCombustible({
  className,
  timeframe,
  fuelCardID,
}: {
  className?: string;
  timeframe?: string;
  fuelCardID?: string;
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
  const fuelCardId = fuelCardID || '';
  const fueldCard = (await getFuelCardData()).map(
    (fueldCarde) => fueldCarde.numeroDeTarjeta
  );
  const data = fuelCardID
    ? await getChipFuel(date, fuelCardId)
    : await getChipFuelTotal(date);
  if (!Array.isArray(data)) {
    // Manejar el error en UI
    return <div>Error al cargar los vehículos</div>;
  }
  const selectedMonthParam = timeframe || months[new Date().getMonth()];
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
        'grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
          Chips de combustible
        </h2>
        <div className="flex flex-wrap justify-between gap-4">
          <PeriodPicker
            items={months}
            defaultValue={selectedMonth}
            sectionKey="chips_combustible"
          />
          <PeriodPicker
            items={fueldCard}
            defaultValue={fuelCardID}
            sectionKey="fuelCardID"
            posibleTitle="Tarjeta"
          />
        </div>
      </div>
      <div className="mb-4 mt-2">
        <ExportChipCombustible data={data} />
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

              <TableCell>
                {chip.fecha.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </TableCell>

              <TableCell className="!text-right text-green-light-1">
                {chip.tipoOperacion}
              </TableCell>

              <TableCell>{chip.tipoCombustible?.nombre || ''}</TableCell>

              <TableCell>
                {chip.valorOperacionLitros?.toFixed(2) || '0.00'}L
              </TableCell>
              <TableCell>{chip.saldoInicio?.toFixed(2) || '0.00'}$</TableCell>
              <TableCell>{chip.saldoFinal?.toFixed(2) || '0.00'}$</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
