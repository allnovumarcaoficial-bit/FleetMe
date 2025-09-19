import { createTimeFrameExtractor } from '@/utils/timeframe-extractor';
import { Suspense } from 'react';
import { OverviewCardsGroup } from './_components/overview-cards';
import { OverviewCardsSkeleton } from './_components/overview-cards/skeleton';
import { Metadata } from 'next';
import { CarDistribution } from '@/components/Charts/VehiculeDistribution';
import { ChipsCombustible } from '@/components/Tables/chips-combustible';
import { KilometrosRecorridosTable } from '@/components/Tables/kilometros-recorridos';
import { KilometrosRecorridos } from '@/components/Charts/km_recorridos';
import { HistorialMantenimientoTable } from '@/components/Tables/mantenimientoTable';
import { GastoTotal } from '@/components/Charts/GastoTotal';
import { IndiceConsumo } from '@/components/Charts/indiceConsumo';
import { TopChipSkeleton } from '@/components/Tables/chips-combustible/skeleton';
import { TopKiloMSkeleton } from '@/components/Tables/kilometros-recorridos/skeleton';
import { TopMantenimientoSkeleton } from '@/components/Tables/mantenimientoTable/skeleton';

export const metadata: Metadata = {
  title: 'Fleet Me',
};
type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid flex-1 grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <GastoTotal
          className="col-span-12 xl:col-span-7"
          key={extractTimeFrame('gasto_total')}
          timeFrame={extractTimeFrame('gasto_total')?.split(':')[1]}
        />
        <KilometrosRecorridos
          key={extractTimeFrame('kilometros_recorridosChart')}
          timeFrame={
            extractTimeFrame('kilometros_recorridosChart')?.split(':')[1]
          }
          className="col-span-12 xl:col-span-5"
        />

        <CarDistribution
          className="col-span-12 xl:col-span-5"
          key={extractTimeFrame('vehicule_distribution')}
          timeFrame={
            extractTimeFrame('vehicule_distribution')?.split(':')[1] || 'Marca'
          }
        />
        <IndiceConsumo
          className="col-span-12 w-full xl:col-span-7"
          key={extractTimeFrame('indice_consumo')}
          timeFrame={extractTimeFrame('indice_consumo')?.split(':')[1]}
          vehiculo_id={extractTimeFrame('vehiculo_id')?.split(':')[1]}
        />

        <div className="col-span-12 xl:col-span-12">
          <Suspense fallback={<TopMantenimientoSkeleton />}>
            <ChipsCombustible
              key={extractTimeFrame('chips_combustible')}
              timeframe={extractTimeFrame('chips_combustible')?.split(':')[1]}
            />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-12">
          <Suspense fallback={<TopKiloMSkeleton />}>
            <KilometrosRecorridosTable
              timeframe={
                extractTimeFrame('kilometros_recorridos')?.split(':')[1]
              }
              key={extractTimeFrame('kilometros_recorridos')?.split(':')[1]}
            />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-12">
          <Suspense fallback={<TopKiloMSkeleton />}>
            <HistorialMantenimientoTable
              timeframe={
                extractTimeFrame('historial_mantenimientos')?.split(':')[1]
              }
              key={extractTimeFrame('historial_mantenimientos')?.split(':')[1]}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
