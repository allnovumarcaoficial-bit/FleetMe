import { CloseIcon, PlusIcon, XIcon } from '@/assets/icons';
import { formatDate } from '@/lib/utils';
import { CalendarEvent } from '@/types/calendar';
import React from 'react';
import { Calendar } from '../Layouts/sidebar/icons';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent: () => void;
}

export function DayDetailModal({
  isOpen,
  onClose,
  selectedDate,
  events,
  onEventClick,
  onAddEvent,
}: DayDetailModalProps) {
  if (!isOpen) return null;

  const dayEvents = events.filter(
    (event) =>
      formatDate(event.startDate.toISOString()) ===
        formatDate(selectedDate.toISOString()) ||
      formatDate(event.endDate.toISOString()) ===
        formatDate(selectedDate.toISOString())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {formatDate(selectedDate.toISOString())}
              </h2>
              <p className="mt-1 text-blue-100">
                {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-white transition-colors duration-200 hover:bg-white/20"
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add Event Button */}
          <button
            onClick={() => {
              onAddEvent();
              onClose();
            }}
            className="mb-6 flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors duration-200 hover:bg-blue-700"
          >
            <PlusIcon />
            <span>Add Event</span>
          </button>

          {/* Events List */}
          <div className="max-h-96 space-y-3 overflow-y-auto">
            {dayEvents.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="mx-auto mb-4 text-gray-500" />
                <p className="text-lg text-gray-400">No events scheduled</p>
                <p className="mt-2 text-sm text-gray-500">
                  Click {'Add Event'} to create your first event
                </p>
              </div>
            ) : (
              dayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => {
                    onEventClick(event);
                    onClose();
                  }}
                  className="cursor-pointer rounded-lg border border-gray-600 bg-gray-700/50 p-4 transition-all duration-200 hover:border-gray-500 hover:bg-gray-700"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="mt-1 h-4 w-4 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-white">
                        {event.title}
                      </h3>

                      {event.time && (
                        <div className="mb-2 flex items-center text-sm text-gray-300">
                          <XIcon className="mr-1" />
                          <span>{event.time}</span>
                        </div>
                      )}

                      <div className="mb-2 flex items-center text-sm text-gray-400">
                        <Calendar className="mr-1" />
                        <span>
                          {event.startDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                          {event.startDate.getTime() !==
                            event.endDate.getTime() && (
                            <span>
                              {' '}
                              -{' '}
                              {event.endDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </span>
                      </div>

                      {event.description && (
                        <p className="line-clamp-2 text-sm text-gray-300">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
