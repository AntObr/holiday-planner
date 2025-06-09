import React, { useState } from 'react';
import { Form, Select, InputNumber, Button, Modal, List, Typography, Space } from 'antd';
import { Division } from '../types/calendar';
import { formatDivisionName, getAvailableYears } from '../utils/calendarUtils';

const { Option } = Select;
const { Text } = Typography;

interface LeaveControlsProps {
  selectedDivision: Division;
  selectedYear: number;
  availableLeave: number;
  usedLeave: number;
  onDivisionChange: (division: Division) => void;
  onYearChange: (year: number) => void;
  onAvailableLeaveChange: (days: number) => void;
  onReset: () => void;
  selectedDays: Date[];
}

export const LeaveControls: React.FC<LeaveControlsProps> = ({
  selectedDivision,
  selectedYear,
  availableLeave,
  usedLeave,
  onDivisionChange,
  onYearChange,
  onAvailableLeaveChange,
  onReset,
  selectedDays,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const divisions: Division[] = ['england-and-wales', 'scotland', 'northern-ireland'];
  const availableYears = getAvailableYears();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatDay = (day: number) => {
    if (day === 1 || day === 21 || day === 31) return `${day}st`;
    if (day === 2 || day === 22) return `${day}nd`;
    if (day === 3 || day === 23) return `${day}rd`;
    return `${day}th`;
  };

  const groupDaysByMonth = () => {
    const grouped: { [key: number]: number[] } = {};
    selectedDays.forEach(date => {
      if (date.getFullYear() === selectedYear) {
        const month = date.getMonth();
        if (!grouped[month]) {
          grouped[month] = [];
        }
        grouped[month].push(date.getDate());
      }
    });
    return grouped;
  };

  const formatConsecutiveDays = (days: number[]) => {
    days.sort((a, b) => a - b);
    const periods: string[] = [];
    let start = days[0];
    let end = days[0];

    for (let i = 1; i < days.length; i++) {
      if (days[i] === end + 1) {
        end = days[i];
      } else {
        if (start === end) {
          periods.push(formatDay(start));
        } else {
          periods.push(`${formatDay(start)} - ${formatDay(end)}`);
        }
        start = days[i];
        end = days[i];
      }
    }

    if (start === end) {
      periods.push(formatDay(start));
    } else {
      periods.push(`${formatDay(start)} - ${formatDay(end)}`);
    }

    return periods;
  };

  const renderModal = () => {
    const groupedDays = groupDaysByMonth();
    return (
      <Modal
        title={`Selected Leave for ${selectedYear}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        ]}
      >
        <List
          dataSource={Object.entries(groupedDays)}
          renderItem={([month, days]) => (
            <List.Item>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>{monthNames[parseInt(month)]}:</Text>
                <List
                  size="small"
                  dataSource={formatConsecutiveDays(days)}
                  renderItem={period => (
                    <List.Item>
                      <Text>• {period}</Text>
                    </List.Item>
                  )}
                />
              </Space>
            </List.Item>
          )}
        />
      </Modal>
    );
  };

  return (
    <Form layout="vertical">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Form.Item label="Region">
          <Select
            value={selectedDivision}
            onChange={onDivisionChange}
            style={{ width: '100%' }}
          >
            {divisions.map((division) => (
              <Option key={division} value={division}>
                {formatDivisionName(division)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Year">
          <Select
            value={selectedYear}
            onChange={onYearChange}
            style={{ width: '100%' }}
          >
            {availableYears.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Available Leave Days">
          <InputNumber
            value={availableLeave}
            onChange={(value) => value !== null && onAvailableLeaveChange(value)}
            min={0}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item label="Used Leave Days">
          <Text>{usedLeave}</Text>
        </Form.Item>

        <Space>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            View My Leave
          </Button>
          <Button onClick={onReset}>
            Reset Selected Days
          </Button>
        </Space>
      </Space>

      {renderModal()}
    </Form>
  );
}; 