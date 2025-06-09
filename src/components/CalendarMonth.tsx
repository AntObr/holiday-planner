import React from 'react';
import { Card, Typography, Space, Grid } from 'antd';
import { CalendarMonth as CalendarMonthType } from '../types/calendar';

const { Title } = Typography;
const { useBreakpoint } = Grid;

interface CalendarMonthProps {
  month: CalendarMonthType;
  onDayClick: (date: Date) => void;
}

export const CalendarMonth: React.FC<CalendarMonthProps> = ({ month, onDayClick }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get the first day of the month to calculate padding
  const firstDay = new Date(month.year, month.month, 1).getDay();
  const paddingDays = Array(firstDay).fill(null);

  return (
    <Card>
      <Title level={4} style={{ textAlign: 'center', marginBottom: 16 }}>
        {monthNames[month.month]} {month.year}
      </Title>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: isMobile ? '2px' : '4px',
        height: isMobile ? '240px' : '280px',
        gridTemplateRows: 'auto repeat(6, 1fr)'
      }}>
        {dayNames.map(day => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              padding: isMobile ? '2px' : '4px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? '12px' : '14px'
            }}
          >
            {day}
          </div>
        ))}
        {paddingDays.map((_, index) => (
          <div
            key={`padding-${index}`}
            style={{
              padding: isMobile ? '2px' : '4px',
              backgroundColor: '#fafafa',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        ))}
        {month.days.map((day, index) => (
          <div
            key={index}
            onClick={() => !day.isBankHoliday && onDayClick(day.date)}
            style={{
              padding: isMobile ? '2px' : '4px',
              textAlign: 'center',
              cursor: day.isBankHoliday ? 'not-allowed' : 'pointer',
              backgroundColor: day.isBankHoliday
                ? '#ff4d4f'
                : day.isSelected
                ? '#ffe066'
                : 'white',
              color: day.isBankHoliday ? 'white' : 'inherit',
              borderRadius: '4px',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? '12px' : '14px'
            }}
            onMouseEnter={(e) => {
              if (!day.isBankHoliday) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title={day.bankHolidayTitle}
          >
            <span>{day.date.getDate()}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}; 