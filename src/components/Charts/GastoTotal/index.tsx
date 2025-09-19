import { PeriodPicker } from '@/components/period-picker';
import { cn, getDateByMonth } from '@/lib/utils';
import { getWeeksProfitData } from '@/services/charts.services';
import { GastoTotalChart } from './charts';
import {
  getFuelCardData,
  getGastoCombustible_Total,
  getMantenimientoTotal,
  getReporteGastos,
} from '@/lib/actions/actions';
import { endOfYear, startOfYear } from 'date-fns';
import { standardFormat } from '@/lib/format-number';

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function GastoTotal({ className, timeFrame }: PropsType) {
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
  const fuelCardId = timeFrame || '';
  const { mantenimientosGastos, combustibleGastos } = await getReporteGastos({
    fuelCardId,
  });
  const mantenimientoData2 = mantenimientosGastos.map((item, index) => {
    return {
      y: item,
      x: months[index].toUpperCase().slice(0, 3),
    };
  });
  const gastosCombustibleData = combustibleGastos.map((item, index) => {
    return {
      y: item,
      x: months[index].toUpperCase().slice(0, 3),
    };
  });
  const dataFormatted = {
    mantenimiento: mantenimientoData2,
    combustible: gastosCombustibleData,
  };
  const fueldCard = (await getFuelCardData()).map(
    (fueldCarde) => fueldCarde.numeroDeTarjeta
  );
  return (
    <div
      className={cn(
        'grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Gastos en operaciones
        </h2>

        <PeriodPicker
          defaultValue={timeFrame}
          items={fueldCard}
          sectionKey="fuelCardID"
          posibleTitle="Tarjeta"
        />
      </div>

      <GastoTotalChart data={dataFormatted} />

      <dl className="grid divide-stroke text-center dark:divide-dark-3 sm:grid-cols-2 sm:divide-x [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1">
        <div className="dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3">
          <dt className="text-xl font-bold text-dark dark:text-white">
            $
            {standardFormat(
              mantenimientoData2.reduce((acc, { y }) => acc + y, 0)
            )}
          </dt>
          <dd className="font-medium dark:text-dark-6">
            Total gastado carga de la tarjeta
          </dd>
        </div>

        <div>
          <dt className="text-xl font-bold text-dark dark:text-white">
            $
            {standardFormat(
              gastosCombustibleData.reduce((acc, { y }) => acc + y, 0)
            )}
          </dt>
          <dd className="font-medium dark:text-dark-6">
            Total gastado en consumo de la tarjeta
          </dd>
        </div>
      </dl>
    </div>
  );
}
