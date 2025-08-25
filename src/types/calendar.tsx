export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
  description?: string;
  time?: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}
