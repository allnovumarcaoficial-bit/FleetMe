import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import CalendarBox from '@/components/CalenderBox';
import { getEventsCalendar } from '@/lib/actions/actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calender Page',
  // other metadata
};

export default async function CalendarPage() {
  const eventsData = await getEventsCalendar();

  return (
    <>
      <Breadcrumb
        pageName="Calendar"
        links={[
          { href: '/', label: 'Home' },
          { href: '/calendar', label: 'Calendar' },
        ]}
      />

      <CalendarBox eventsData={eventsData} />
    </>
  );
}
