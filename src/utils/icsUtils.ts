import { Division } from '../types/calendar';

export const generateICSContent = (
  selectedDays: Date[],
  division: Division,
  year: number
): string => {
  // Format date to YYYYMMDD, ensuring we're working with local dates
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // Generate a unique identifier
  const generateUID = (): string => {
    return `holiday-planner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@${window.location.hostname}`;
  };

  // Format the division name for the description
  const formatDivisionName = (div: Division): string => {
    return div.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Create the calendar header
  const calendarHeader = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Holiday Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Annual Leave',
    'X-WR-TIMEZONE:Europe/London'
  ].join('\r\n');

  // Sort dates to ensure proper ordering
  const sortedDays = [...selectedDays].sort((a, b) => a.getTime() - b.getTime());

  // Group consecutive days
  const groups: Date[][] = [];
  let currentGroup: Date[] = [];

  sortedDays.forEach((date, index) => {
    if (index === 0) {
      currentGroup.push(date);
    } else {
      const prevDate = sortedDays[index - 1];
      const dayDiff = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        currentGroup.push(date);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [date];
      }
    }
  });
  
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // Get current timestamp in UTC
  const now = new Date();
  const timestamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
    'T',
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
    String(now.getUTCSeconds()).padStart(2, '0'),
    'Z'
  ].join('');

  // Create events for each group of consecutive days
  const events = groups.map(group => {
    const startDate = formatDate(group[0]);
    // For DTEND, we need the day after the last day (exclusive)
    const endDate = new Date(group[group.length - 1]);
    endDate.setDate(endDate.getDate() + 1);
    const endDateStr = formatDate(endDate);

    const eventLines = [
      'BEGIN:VEVENT',
      `DTSTAMP:${timestamp}`,
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${endDateStr}`,
      `UID:${generateUID()}`,
      'SUMMARY:Annual Leave',
      `DESCRIPTION:Annual Leave for ${formatDivisionName(division)} in ${year}`,
      'TRANSP:TRANSPARENT',
      'SEQUENCE:0',
      'END:VEVENT'
    ];

    return eventLines.join('\r\n');
  }).join('\r\n');

  // Create the calendar footer
  const calendarFooter = 'END:VCALENDAR';

  // Combine all parts
  return `${calendarHeader}\r\n${events}\r\n${calendarFooter}`;
};

export const downloadICS = (content: string, year: number): void => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `annual-leave-${year}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}; 