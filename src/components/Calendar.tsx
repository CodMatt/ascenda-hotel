import React, { useState } from 'react';

interface CalendarProps {
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getDaysInMonth = (month: number, year: number): number =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month: number, year: number): number =>
    new Date(year, month, 1).getDay();

  const formatDate = (year: number, month: number, day: number): string => {
    const date = new Date(year, month, day);
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderCalendar = (): React.ReactNode => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = formatDate(currentYear, currentMonth, day);
      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}
          onClick={() => !isPast && onDateSelect(dateStr)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="calendar-overlay" onClick={onClose}>
      <div className="calendar-popup" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-header">
          <button className="nav-btn" onClick={() => navigateMonth(-1)}>‹</button>
          <h3>{monthNames[currentMonth]} {currentYear}</h3>
          <button className="nav-btn" onClick={() => navigateMonth(1)}>›</button>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="calendar-weekdays">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
            <div key={d} className="weekday">{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
