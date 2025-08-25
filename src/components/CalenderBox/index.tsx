'use client';

import { addMonths } from '@/lib/utils';
import { CalendarEvent } from '@/types/calendar';
import { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { DayDetailModal } from './DayDatail';

const CalendarBox = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const handlePrevMonth = () => {
    setCurrentDate(addMonths(currentDate, -1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  const handleAddEvent = () => {
    setEditingEvent(undefined);
    setSelectedDate(new Date());
    setIsModalOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDayDetailOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(undefined);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="container mx-auto px-6 py-8">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onAddEvent={handleAddEvent}
        />

        <div className="mt-6">
          <CalendarGrid
            currentDate={currentDate}
            events={events}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        </div>
        <DayDetailModal
          isOpen={isDayDetailOpen}
          onClose={() => setIsDayDetailOpen(false)}
          selectedDate={selectedDate || new Date()}
          events={events}
          onEventClick={handleEventClick}
          onAddEvent={() => {
            setEditingEvent(undefined);
            setIsModalOpen(true);
          }}
        />
      </div>
    </>
  );
};
export default CalendarBox;
