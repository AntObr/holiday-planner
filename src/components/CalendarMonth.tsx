import React from 'react';
import { CalendarMonth as CalendarMonthType } from '../types/calendar';

interface CalendarMonthProps {
  month: CalendarMonthType;
  onDayClick: (date: Date) => void;
}

export const CalendarMonth: React.FC<CalendarMonthProps> = ({ month, onDayClick }) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get the first day of the month to calculate padding
  const firstDay = new Date(month.year, month.month, 1).getDay();
  const paddingDays = Array(firstDay).fill(null);

  return (
    <div className="grid-column-one-third">
      <div className="calendar-month">
        <h3 className="calendar-month-title">
          {monthNames[month.month]} {month.year}
        </h3>
        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-header">
              {day}
            </div>
          ))}
          {paddingDays.map((_, index) => (
            <div key={`padding-${index}`} className="calendar-day padding" />
          ))}
          {month.days.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${
                day.isBankHoliday ? 'bank-holiday' :
                day.isSelected ? 'selected' : ''
              }`}
              onClick={() => !day.isBankHoliday && onDayClick(day.date)}
              title={day.bankHolidayTitle}
            >
              <span className="day-number">{day.date.getDate()}</span>
              {day.isBankHoliday && (
                <span className="bank-holiday-indicator" title={day.bankHolidayTitle}>*</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 