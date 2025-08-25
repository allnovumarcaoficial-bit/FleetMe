import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Función para formatear fechas en formato latinoamericano
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export function getMonthName(date: string) {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  const currentMonthIndex = new Date(date).getMonth();
  return months[currentMonthIndex];
}
export function getDateByMonth(month: string) {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  const normalizedMonthName = month.trim().toLowerCase();
  const monthIndex = months.findIndex(
    (month) => month.toLowerCase() === normalizedMonthName
  );
  const date = new Date(new Date().getFullYear(), monthIndex, 1);
  return date;
}
export const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Add days from previous month to fill the first week
  const startDay = firstDay.getDay();
  for (let i = startDay - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // Add days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  // Add days from next month to fill the last week
  const totalCells = 42; // 6 rows × 7 days
  const remainingCells = totalCells - days.length;
  for (let day = 1; day <= remainingCells; day++) {
    days.push(new Date(year, month + 1, day));
  }

  return days;
};

export const isSameDate = (date1: Date, date2: Date): boolean => {
  return formatDate(date1.toISOString()) === formatDate(date2.toISOString());
};

export const getYear = (date: Date): number => {
  return date.getFullYear();
};

export const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

export const isDateInRange = (
  date: Date,
  startDate: Date,
  endDate: Date
): boolean => {
  const dateStr = formatDate(date.toISOString());
  const startStr = formatDate(startDate.toISOString());
  const endStr = formatDate(endDate.toISOString());
  return dateStr >= startStr && dateStr <= endStr;
};
