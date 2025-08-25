import { PaymentsOverview } from '@/components/Charts/payments-overview';
import { UsedDevices } from '@/components/Charts/used-devices';
import { WeeksProfit } from '@/components/Charts/weeks-profit';
import { TopChannels } from '@/components/Tables/top-channels';
import { TopChannelsSkeleton } from '@/components/Tables/top-channels/skeleton';
import { createTimeFrameExtractor } from '@/utils/timeframe-extractor';
import { Suspense } from 'react';
import { ChatsCard } from './_components/chats-card';
import { OverviewCardsGroup } from './_components/overview-cards';
import { OverviewCardsSkeleton } from './_components/overview-cards/skeleton';
import { Metadata } from 'next';
import { CarDistribution } from '@/components/Charts/VehiculeDistribution';
import { ChipsCombustible } from '@/components/Tables/chips-combustible';
import { KilometrosRecorridosTable } from '@/components/Tables/kilometros-recorridos';

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
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <PaymentsOverview
          className="col-span-12 xl:col-span-7"
          key={extractTimeFrame('payments_overview')}
          timeFrame={extractTimeFrame('payments_overview')?.split(':')[1]}
        />

        <WeeksProfit
          key={extractTimeFrame('weeks_profit')}
          timeFrame={extractTimeFrame('weeks_profit')?.split(':')[1]}
          className="col-span-12 xl:col-span-5"
        />

        <CarDistribution
          className="col-span-12 xl:col-span-5"
          key={extractTimeFrame('vehicule_distribution')}
          timeFrame={
            extractTimeFrame('vehicule_distribution')?.split(':')[1] || 'Marca'
          }
        />

        <div className="col-span-16 grid w-full xl:col-span-12">
          {/* <Suspense fallback={<TopChannelsSkeleton />}>
            <ChipsCombustible
              key={extractTimeFrame('chips_combustible')}
              timeframe={extractTimeFrame('chips_combustible')?.split(':')[1]}
            />
          </Suspense> */}
        </div>
        <div className="col-span-16 w-full xl:col-span-12">
          <Suspense fallback={<TopChannelsSkeleton />}>
            <KilometrosRecorridosTable
              timeframe={
                extractTimeFrame('kilometros_recorridos')?.split(':')[1]
              }
              key={extractTimeFrame('kilometros_recorridos')?.split(':')[1]}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}
