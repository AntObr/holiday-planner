import React, { useEffect, useState } from 'react';
import { BankHolidaysService } from './services/bankHolidaysService';
import { LeaveControls } from './components/LeaveControls';
import { CalendarMonth } from './components/CalendarMonth';
import { Division, CalendarMonth as CalendarMonthType, LeaveState } from './types/calendar';
import { createCalendarMonth } from './utils/calendarUtils';
import './styles/main.css';
import './styles/calendar.css';

function App() {
  const [selectedDivision, setSelectedDivision] = useState<Division>(() => {
    const saved = localStorage.getItem('selectedDivision');
    return saved ? (saved as Division) : 'england-and-wales';
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = localStorage.getItem('selectedYear');
    return saved ? parseInt(saved, 10) : new Date().getFullYear();
  });
  const [availableLeave, setAvailableLeave] = useState(() => {
    const saved = localStorage.getItem('availableLeave');
    return saved ? parseInt(saved, 10) : 20;
  });
  const [leaveState, setLeaveState] = useState<LeaveState>(() => {
    const saved = localStorage.getItem('leaveState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        selectedDays: parsed.selectedDays.map((dateStr: string) => new Date(dateStr)),
      };
    }
    return { selectedDays: [], availableDays: 20, usedDays: 0 };
  });
  const [calendarMonths, setCalendarMonths] = useState<CalendarMonthType[]>([]);
  const [bankHolidays, setBankHolidays] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchBankHolidays = async () => {
      const service = BankHolidaysService.getInstance();
      const data = await service.getBankHolidays();
      const holidays = data[selectedDivision].events.reduce((acc, event) => {
        acc[event.date] = event.title;
        return acc;
      }, {} as { [key: string]: string });
      setBankHolidays(holidays);
    };

    fetchBankHolidays();
  }, [selectedDivision]);

  useEffect(() => {
    const months = Array.from({ length: 12 }, (_, i) =>
      createCalendarMonth(selectedYear, i, bankHolidays, leaveState.selectedDays)
    );
    setCalendarMonths(months);
  }, [selectedYear, bankHolidays, leaveState.selectedDays]);

  const handleDayClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const isSelected = leaveState.selectedDays.some(
      d => d.toISOString().split('T')[0] === dateString
    );

    let newSelectedDays: Date[];
    if (isSelected) {
      newSelectedDays = leaveState.selectedDays.filter(
        d => d.toISOString().split('T')[0] !== dateString
      );
    } else {
      if (leaveState.usedDays >= availableLeave) {
        return; // Can't select more days than available
      }
      newSelectedDays = [...leaveState.selectedDays, date];
    }

    setLeaveState({
      ...leaveState,
      selectedDays: newSelectedDays,
      usedDays: newSelectedDays.length,
    });
  };

  const handleReset = () => {
    const currentYearSelectedDays = leaveState.selectedDays.filter(
      date => date.getFullYear() === selectedYear
    );
    const otherYearsSelectedDays = leaveState.selectedDays.filter(
      date => date.getFullYear() !== selectedYear
    );
    setLeaveState({
      ...leaveState,
      selectedDays: otherYearsSelectedDays,
      usedDays: leaveState.usedDays - currentYearSelectedDays.length,
    });
  };

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('selectedDivision', selectedDivision);
  }, [selectedDivision]);

  useEffect(() => {
    localStorage.setItem('selectedYear', selectedYear.toString());
  }, [selectedYear]);

  useEffect(() => {
    localStorage.setItem('availableLeave', availableLeave.toString());
  }, [availableLeave]);

  useEffect(() => {
    localStorage.setItem('leaveState', JSON.stringify(leaveState));
  }, [leaveState]);

  return (
    <div className="container">
      <main className="main-wrapper">
        <h1 className="heading-xl">Holiday Planner</h1>
        
        <LeaveControls
          selectedDivision={selectedDivision}
          selectedYear={selectedYear}
          availableLeave={availableLeave}
          usedLeave={leaveState.usedDays}
          onDivisionChange={setSelectedDivision}
          onYearChange={setSelectedYear}
          onAvailableLeaveChange={setAvailableLeave}
          onReset={handleReset}
          selectedDays={leaveState.selectedDays}
        />

        <div className="grid-row">
          {calendarMonths.map((month, index) => (
            <CalendarMonth
              key={index}
              month={month}
              onDayClick={handleDayClick}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
