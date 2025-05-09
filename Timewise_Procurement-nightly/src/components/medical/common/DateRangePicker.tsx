import React from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

/**
 * Date Range Picker Component
 * 
 * Component for selecting date ranges
 */
const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onDateRangeChange }) => {
  // Predefined date ranges
  const dateRanges = [
    { id: 'today', name: 'Today', getRange: () => {
      const today = new Date().toISOString().split('T')[0];
      return { start: today, end: today };
    }},
    { id: 'yesterday', name: 'Yesterday', getRange: () => {
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
      return { start: yesterday, end: yesterday };
    }},
    { id: 'last7days', name: 'Last 7 Days', getRange: () => {
      const end = new Date().toISOString().split('T')[0];
      const start = new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0];
      return { start, end };
    }},
    { id: 'last30days', name: 'Last 30 Days', getRange: () => {
      const end = new Date().toISOString().split('T')[0];
      const start = new Date(new Date().setDate(new Date().getDate() - 29)).toISOString().split('T')[0];
      return { start, end };
    }},
    { id: 'thisMonth', name: 'This Month', getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date().toISOString().split('T')[0];
      return { start, end };
    }},
    { id: 'lastMonth', name: 'Last Month', getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      return { start, end };
    }}
  ];

  // Handle preset selection
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPreset = e.target.value;
    if (selectedPreset === 'custom') {
      return; // Don't change date range for custom option
    }
    
    const preset = dateRanges.find(range => range.id === selectedPreset);
    if (preset) {
      const range = preset.getRange();
      onDateRangeChange(range.start, range.end);
    }
  };

  // Determine if current selection is a preset
  const determinePreset = (): string => {
    for (const range of dateRanges) {
      const { start, end } = range.getRange();
      if (start === startDate && end === endDate) {
        return range.id;
      }
    }
    return 'custom';
  };

  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-40">
        <label htmlFor="date-range-preset" className="block text-sm font-medium text-gray-700 mb-1">
          Date Range
        </label>
        <select
          id="date-range-preset"
          value={determinePreset()}
          onChange={handlePresetChange}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          {dateRanges.map((range) => (
            <option key={range.id} value={range.id}>
              {range.name}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
          Start Date
        </label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          max={endDate}
          onChange={(e) => onDateRangeChange(e.target.value, endDate)}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      
      <div>
        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
          End Date
        </label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          min={startDate}
          max={new Date().toISOString().split('T')[0]} // Can't select future dates
          onChange={(e) => onDateRangeChange(startDate, e.target.value)}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );
};

export default DateRangePicker;