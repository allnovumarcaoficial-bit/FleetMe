import { PeriodPicker } from '@/components/period-picker';
import { standardFormat } from '@/lib/format-number';
import { cn, getDateByMonth } from '@/lib/utils';
import { getAllVehiculos, getIndiceConsumo } from '@/lib/actions/actions';
import { IndiceConsumoChart } from './chart';
import { formatDate } from 'date-fns';
type PropsType = {
  timeFrame?: string;
  className?: string;
  vehiculo_id?: string;
};

export async function IndiceConsumo({
  timeFrame,
  className,
  vehiculo_id,
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
  const data = await getIndiceConsumo(vehiculo_id || '', date);
  const promedioConsumo = data.data.map((item) => {
    return {
      x: formatDate(
        item.fecha?.toISOString() || new Date().toISOString(),
        'dd/MM/yyyy'
      ),
      y: item.indiceConsumo,
    };
  });
  const autos = (await getAllVehiculos()).map((vehiculo) => vehiculo.matricula);

  return (
    <div
      className={cn(
        'grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Indice de consumo
        </h2>
        <div className="flex flex-wrap justify-between gap-4">
          <PeriodPicker
            items={autos}
            defaultValue={vehiculo_id}
            sectionKey="vehiculo_id"
            posibleTitle="Seleccione un vehículo"
          />

          <PeriodPicker
            items={months}
            defaultValue={timeFrame || months[new Date().getMonth()]}
            sectionKey="indice_consumo"
          />
        </div>
      </div>

      <IndiceConsumoChart data={{ indiceConsumo: promedioConsumo }} />

      <dl className="grid divide-stroke text-center dark:divide-dark-3 sm:grid-cols-2 sm:divide-x [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1">
        <div className="dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3">
          <dt className="text-xl font-bold text-dark dark:text-white">
            ${standardFormat(data.promedioConsumo)}
          </dt>
          <dd className="font-medium dark:text-dark-6">
            Promedio del consumo gastasdo en el mes
          </dd>
        </div>
      </dl>
    </div>
  );
}
