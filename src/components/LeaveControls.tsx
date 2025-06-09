import React, { useState } from 'react';
import { Division } from '../types/calendar';
import { formatDivisionName, getAvailableYears } from '../utils/calendarUtils';

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
  const divisions: Division[] = ['england-and-wales', 'scotland', 'northern-ireland'];
  const availableYears = getAvailableYears();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <div className="modal">
        <div className="modal-content">
          <h2>Selected Leave for {selectedYear}</h2>
          <ul>
            {Object.entries(groupedDays).map(([month, days]) => (
              <li key={month}>
                <strong>{monthNames[parseInt(month)]}:</strong> {formatConsecutiveDays(days).join(', ')}
              </li>
            ))}
          </ul>
          <button onClick={() => setIsModalOpen(false)}>Close</button>
        </div>
      </div>
    );
  };

  return (
    <div className="grid-row">
      <div className="grid-column-one-third">
        <div className="form-group">
          <label className="label" htmlFor="region">
            Region
          </label>
          <select
            className="select"
            id="region"
            value={selectedDivision}
            onChange={(e) => onDivisionChange(e.target.value as Division)}
          >
            {divisions.map((division) => (
              <option key={division} value={division}>
                {formatDivisionName(division)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-column-one-third">
        <div className="form-group">
          <label className="label" htmlFor="year">
            Year
          </label>
          <select
            className="select"
            id="year"
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-column-one-third">
        <div className="form-group">
          <label className="label" htmlFor="available-leave">
            Available Leave (days)
          </label>
          <input
            className="input input--width-3"
            id="available-leave"
            type="number"
            min="0"
            max="365"
            value={availableLeave}
            onChange={(e) => onAvailableLeaveChange(Number(e.target.value))}
          />
          <div className="hint">
            Days used: {usedLeave} / {availableLeave}
          </div>
        </div>
      </div>

      <div className="form-group">
        <button onClick={onReset} className="reset-button">
          Reset Selected Days
        </button>
      </div>

      <div className="form-group">
        <button onClick={() => setIsModalOpen(true)} className="view-leave-button">
          View My Leave
        </button>
      </div>

      {isModalOpen && renderModal()}
    </div>
  );
}; 