import { getDaysInMonth, isSameDate } from '@/lib/utils';
import { CalendarEvent } from '@/types/calendar';
import React from 'react';
import { CalendarDay } from './CalendarDay';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const daysOfWeek = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export function CalendarGrid({
  currentDate,
  events,
  onDayClick,
  onEventClick,
}: CalendarGridProps) {
  const days = getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  const today = new Date();

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800/30 backdrop-blur-sm">
      {/* Days of week header */}
      <div className="grid grid-cols-7 bg-gradient-to-r from-blue-600 to-purple-600">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="p-4 text-center text-sm font-semibold text-white"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => (
          <CalendarDay
            key={index}
            date={date}
            isCurrentMonth={date.getMonth() === currentDate.getMonth()}
            isToday={isSameDate(date, today)}
            events={events}
            onClick={onDayClick}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}
