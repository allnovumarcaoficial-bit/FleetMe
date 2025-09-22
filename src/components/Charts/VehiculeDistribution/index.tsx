import { TrendingUpIcon } from '@/assets/icons';
import { compactFormat } from '@/lib/format-number';
import { cn } from '@/lib/utils';
import { getCampaignVisitorsData } from '@/services/charts.services';
import { CarData, VehiculeDistribution } from './donutVehicule';
import { getVehiculesByType, TypeEnum } from '@/lib/actions/actions';
import { PeriodPicker } from '@/components/period-picker';

export async function CarDistribution({
  className,
  timeFrame = 'Administrativo',
}: {
  className?: string;
  timeFrame: string;
}) {
  let type: TypeEnum = 'Administrativo';
  if (timeFrame === 'Administrativo') {
    type = 'Administrativo';
  }
  if (timeFrame === 'Entrega de Pedidos') {
    type = 'EntregaDePedidos';
  }
  if (timeFrame === 'Logístico') {
    type = 'Logistico';
  }

  const data = await getVehiculesByType({ type });
  if (!Array.isArray(data)) {
    // Manejar el error en UI
    return <div>Error al cargar los vehículos</div>;
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 grid-rows-[auto_1fr] gap-4 rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card sm:gap-6 sm:p-6 xl:gap-7.5 xl:p-7.5',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-body-lg sm:text-body-xlg font-bold text-dark dark:text-white xl:text-body-2xlg">
          Distribución de Vehículos
        </h2>

        <PeriodPicker
          items={['Administrativo', 'Entrega de Pedidos', 'Logístico']}
          defaultValue={timeFrame || 'Administrativo'}
          sectionKey="vehicule_distribution"
        />
      </div>

      <div className="relative w-full">
        <div className="mx-auto max-w-full overflow-visible">
          <VehiculeDistribution data={data} />
        </div>
      </div>
    </div>
  );
}
