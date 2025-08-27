import { PeriodPicker } from '@/components/period-picker';
import { cn, getDateByMonth } from '@/lib/utils';
import { getWeeksProfitData } from '@/services/charts.services';
import { KilometrosRecorridosChart } from './chart';
import {
  getGastosMantenimiento_Combustible,
  getKilometrosRecorridosChart,
} from '@/lib/actions/actions';
import { SadFaceError } from '@/components/Tables/icons';

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function KilometrosRecorridos({
  className,
  timeFrame,
}: PropsType) {
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

  const date = getDateByMonth(timeFrame || months[new Date().getMonth()]);
  const data = await getGastosMantenimiento_Combustible({ fecha: date });

  if (!Array.isArray(data)) {
    console.log('Error al cargar los kilómetros recorridos');
    return (
      <div
        className={cn(
          'rounded-[10px] bg-white px-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card',
          className
        )}
      >
        <div className="flex h-80 flex-col items-center justify-center space-y-4">
          <SadFaceError className="mx-auto" />
          {data === 0 ? (
            <p className="text-center text-xl text-gray-500">
              No hay datos disponibles
            </p>
          ) : (
            <p className="text-center text-xl text-red-500">
              Error al cargar el gráfico de Gastos de mantenimiento y
              combustible
            </p>
          )}
        </div>
      </div>
    );
  }
  const mantenimientoData = data.map((item) => item.mantenimientos);
  const gastosCombustibleData = data.map((item) => item.gastosCombustible);
  const dataFormatted = {
    mantenimientos: mantenimientoData,
    gastosCombustible: gastosCombustibleData,
  };
  return (
    <div
      className={cn(
        'rounded-[10px] bg-white px-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Kilómetros Recorridos en {timeFrame || months[new Date().getMonth()]}
        </h2>

        <PeriodPicker
          items={months}
          defaultValue={timeFrame || 'Enero'}
          sectionKey="kilometros_recorridosChart"
        />
      </div>

      <KilometrosRecorridosChart data={dataFormatted} />
    </div>
  );
}
