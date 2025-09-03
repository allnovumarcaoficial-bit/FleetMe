import React from 'react';
import { isDateInRange, isSameDate } from '@/lib/utils';
import { CalendarEvent } from '@/types/calendar';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  onClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  events,
  onClick,
  onEventClick,
}: CalendarDayProps) {
  const dayEvents = events.filter((event) =>
    isDateInRange(date, event.startDate, event.endDate)
  );

  return (
    <div
      className={`min-h-[120px] cursor-pointer border border-gray-700 p-2 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-gray-700/50 ${
        !isCurrentMonth ? 'bg-white/30' : 'bg-white dark:bg-gray-800/50'
      } ${isToday ? 'ring-2 ring-sky-400 dark:ring-blue-500' : ''}`}
      onClick={() => onClick(date)}
    >
      <div
        className={`mb-2 text-sm font-medium ${
          isCurrentMonth ? 'text-black dark:text-white' : 'text-gray-500'
        } ${isToday ? 'text-blue-400' : ''}`}
      >
        {date.getDate()}
      </div>

      <div className="space-y-1">
        {dayEvents.slice(0, 3).map((event) => {
          const isStartDate = isSameDate(date, event.startDate);
          const isEndDate = isSameDate(date, event.endDate);
          return (
            <div
              key={`${event.id}-${date.getTime()}`}
              className={`cursor-pointer px-2 py-1 text-xs text-white transition-all duration-200 hover:opacity-80 ${
                isStartDate && isEndDate
                  ? 'rounded-md'
                  : isStartDate
                    ? 'rounded-l-md'
                    : isEndDate
                      ? 'rounded-r-md'
                      : ''
              }`}
              style={{ backgroundColor: event.color }}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
            >
              {isStartDate && (
                <div className="truncate font-medium">{event.title}</div>
              )}
              {isStartDate && !isEndDate && (
                <div className="text-xs opacity-75">
                  {event.startDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  -{' '}
                  {event.endDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              )}
            </div>
          );
        })}

        {dayEvents.length > 3 && (
          <div className="px-2 text-xs text-gray-400">
            +{dayEvents.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}
