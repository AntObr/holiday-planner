export interface CalendarDay {
  date: Date;
  isBankHoliday: boolean;
  isSelected: boolean;
  bankHolidayTitle?: string;
}

export interface CalendarMonth {
  month: number;
  year: number;
  days: CalendarDay[];
}

export type Division = 'england-and-wales' | 'scotland' | 'northern-ireland';

export interface LeaveState {
  selectedDays: Date[];
  availableDays: number;
  usedDays: number;
} 