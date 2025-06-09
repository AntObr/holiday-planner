import { CalendarDay, CalendarMonth } from '../types/calendar';

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const formatDivisionName = (division: string): string => {
  return division
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getAvailableYears = (): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear + i);
};

export const createCalendarMonth = (
  year: number,
  month: number,
  bankHolidays: { [key: string]: string },
  selectedDays: Date[]
): CalendarMonth => {
  const daysInMonth = getDaysInMonth(year, month);
  const days: CalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    const isBankHoliday = dateString in bankHolidays;
    const isSelected = selectedDays.some(
      selectedDate => selectedDate.toISOString().split('T')[0] === dateString
    );

    days.push({
      date,
      isBankHoliday,
      isSelected,
      bankHolidayTitle: isBankHoliday ? bankHolidays[dateString] : undefined,
    });
  }

  return {
    month,
    year,
    days,
  };
}; 