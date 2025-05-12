import React, { useState } from 'react';
import { format, addDays, subDays, parse, isValid } from 'date-fns';

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD format
  onDateChange: (date: string) => void;
  className?: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
  className = ''
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempDate, setTempDate] = useState(selectedDate);
  
  const parsedDate = parse(selectedDate, 'yyyy-MM-dd', new Date());
  const formattedDate = isValid(parsedDate) 
    ? format(parsedDate, 'MMMM d, yyyy')
    : 'Invalid date';
  
  const previousDay = () => {
    if (isValid(parsedDate)) {
      const newDate = format(subDays(parsedDate, 1), 'yyyy-MM-dd');
      onDateChange(newDate);
    }
  };
  
  const nextDay = () => {
    if (isValid(parsedDate)) {
      const newDate = format(addDays(parsedDate, 1), 'yyyy-MM-dd');
      onDateChange(newDate);
    }
  };
  
  const today = () => {
    const newDate = format(new Date(), 'yyyy-MM-dd');
    onDateChange(newDate);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempDate(e.target.value);
  };
  
  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedTempDate = parse(tempDate, 'yyyy-MM-dd', new Date());
    if (isValid(parsedTempDate)) {
      onDateChange(tempDate);
      setShowCalendar(false);
    }
  };
  
  return (
    <div className={`date-selector relative ${className}`}>
      <div className="flex items-center space-x-2">
        <button
          onClick={previousDay}
          className="p-1 rounded hover:bg-gray-200"
          aria-label="Previous day"
          title="Previous day"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formattedDate}
          </button>
          
          {showCalendar && (
            <div className="absolute z-10 mt-1 bg-white shadow-lg border rounded p-4 w-64">
              <form onSubmit={handleDateSubmit} className="mb-4">
                <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-1">
                  Select date:
                </label>
                <div className="flex">
                  <input
                    type="date"
                    id="date-picker"
                    value={tempDate}
                    onChange={handleDateChange}
                    className="flex-1 border rounded px-2 py-1 text-sm"
                  />
                  <button
                    type="submit"
                    className="ml-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Go
                  </button>
                </div>
              </form>
              
              <div className="mb-2">
                <button
                  onClick={() => {
                    today();
                    setShowCalendar(false);
                  }}
                  className="w-full text-left text-sm text-blue-600 hover:bg-blue-50 p-2 rounded"
                >
                  Today
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs text-gray-500 font-medium">
                    {day}
                  </div>
                ))}
                
                {/* Calendar cells would go here */}
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={nextDay}
          className="p-1 rounded hover:bg-gray-200"
          aria-label="Next day"
          title="Next day"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button 
          onClick={() => {
            today();
          }}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          Today
        </button>
      </div>
    </div>
  );
};

export default DateSelector;