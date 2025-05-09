import React from 'react';

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onDateChange }) => {
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  // Navigate to today
  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={goToPreviousDay}
        className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Previous day"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={goToToday}
        className="px-3 py-1 text-sm font-medium text-blue-700 border border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Today
      </button>
      
      <div className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm">
        {formatDate(selectedDate)}
      </div>
      
      <button
        onClick={goToNextDay}
        className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Next day"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default DateNavigator;
