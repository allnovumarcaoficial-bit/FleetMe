import { TrendingUpIcon } from '@/assets/icons';
import { compactFormat } from '@/lib/format-number';
import { cn } from '@/lib/utils';
import { getCampaignVisitorsData } from '@/services/charts.services';
import { CarData, VehiculeDistribution } from './donutVehicule';
import { getVehiculesByType, TypeEnum } from '@/lib/actions/actions';
import { PeriodPicker } from '@/components/period-picker';

export async function CarDistribution({
  className,
  timeFrame = 'Marca',
}: {
  className?: string;
  timeFrame: string;
}) {
  let type: TypeEnum = 'marca';
  if (timeFrame === 'Marca') {
    type = 'marca';
  }
  if (timeFrame === 'Modelo') {
    type = 'modelo';
  }
  if (timeFrame === 'Tipo de Vehículo') {
    type = 'tipo_vehiculo';
  }

  const data = await getVehiculesByType({ type });
  if (!Array.isArray(data)) {
    // Manejar el error en UI
    return <div>Error al cargar los vehículos</div>;
  }
  return (
    <div
      className={cn(
        'grid grid-cols-1 grid-rows-[auto_1fr] gap-9 rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Distribución de Vehículos
        </h2>

        <PeriodPicker
          items={['Marca', 'Modelo', 'Tipo de Vehículo']}
          defaultValue={timeFrame || 'Marca'}
          sectionKey="vehicule_distribution"
        />
      </div>

      <div className="grid place-items-center">
        <VehiculeDistribution data={data} />
      </div>
    </div>
  );
}
