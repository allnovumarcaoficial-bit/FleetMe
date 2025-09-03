import React from 'react';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ChevronUpIcon,
  PlusIcon,
} from '@/assets/icons';
import { getMonthName, getYear } from '@/lib/utils';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddEvent: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onAddEvent,
}) => {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* <button
            onClick={onAddEvent}
            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
          >
            <PlusIcon />
            <span>Add Event</span>
          </button> */}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onPrevMonth}
            className="rounded-lg p-2 transition-colors duration-200 hover:bg-gray-700"
          >
            <ArrowDownIcon className="size-4 text-gray-400 hover:text-white" />
          </button>

          <h2 className="min-w-[200px] text-center text-xl font-semibold text-dark-2 dark:text-white">
            {getMonthName(currentDate.toISOString())} {getYear(currentDate)}
          </h2>

          <button
            onClick={onNextMonth}
            className="rounded-lg p-2 transition-colors duration-200 hover:bg-gray-700"
          >
            <ArrowUpIcon className="size-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
