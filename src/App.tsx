import React, { useEffect, useState } from 'react';
import { Layout, Typography, Row, Col, Card, Space } from 'antd';
import { BankHolidaysService } from './services/bankHolidaysService';
import { LeaveControls } from './components/LeaveControls';
import { CalendarMonth } from './components/CalendarMonth';
import { Division, CalendarMonth as CalendarMonthType, LeaveState } from './types/calendar';
import { createCalendarMonth } from './utils/calendarUtils';
import 'antd/dist/reset.css';

const { Header, Content } = Layout;
const { Title } = Typography;

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
    <Layout style={{ minHeight: '100vh', width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Title level={2} style={{ margin: '12px 0' }}>Holiday Planner</Title>
      </Header>
      <Content style={{ 
        padding: '16px',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden'
      }}>
        <div style={{ 
          background: '#fff', 
          padding: '16px',
          minHeight: 'calc(100vh - 64px)',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card bodyStyle={{ padding: '16px' }}>
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
            </Card>
            <Row gutter={[16, 16]}>
              {calendarMonths.map((month, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <CalendarMonth
                    month={month}
                    onDayClick={handleDayClick}
                  />
                </Col>
              ))}
            </Row>
          </Space>
        </div>
      </Content>
    </Layout>
  );
}

export default App;
