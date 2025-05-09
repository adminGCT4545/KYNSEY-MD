import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import FinancialDashboard from './reports/FinancialDashboard';
import ClinicalMetrics from './reports/ClinicalMetrics';
import OperationalStats from './reports/OperationalStats';
import CustomReportBuilder from './reports/CustomReportBuilder';
import ReportSelector from './reports/ReportSelector';
import DateRangePicker from './common/DateRangePicker';
import LocationSelector from './LocationSelector';

/**
 * Reports & Analytics View Component
 * 
 * Main component for accessing various reports and analytics
 */
const ReportsAnalyticsView: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('financial');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [location, setLocation] = useState<string>('all');
  
  // Handle report type change
  const handleReportTypeChange = (reportType: string) => {
    setSelectedReport(reportType);
  };
  
  // Handle date range change
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };
  
  // Handle location change
  const handleLocationChange = (locationId: string) => {
    setLocation(locationId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Reports & Analytics</h1>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <ReportSelector selectedReport={selectedReport} onReportChange={handleReportTypeChange} />
          <DateRangePicker 
            startDate={dateRange.startDate} 
            endDate={dateRange.endDate} 
            onDateRangeChange={handleDateRangeChange} 
          />
          <LocationSelector
            selectedLocation={location}
            onLocationChange={handleLocationChange}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <Tab.Group selectedIndex={getTabIndex(selectedReport)}>
          <Tab.Panels>
            <Tab.Panel>
              <FinancialDashboard 
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                location={location}
              />
            </Tab.Panel>
            <Tab.Panel>
              <ClinicalMetrics 
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                location={location}
              />
            </Tab.Panel>
            <Tab.Panel>
              <OperationalStats 
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                location={location}
              />
            </Tab.Panel>
            <Tab.Panel>
              <CustomReportBuilder
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                location={location}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

// Helper function to get tab index based on selected report
const getTabIndex = (reportType: string): number => {
  switch (reportType) {
    case 'financial':
      return 0;
    case 'clinical':
      return 1;
    case 'operational':
      return 2;
    case 'custom':
      return 3;
    default:
      return 0;
  }
};

export default ReportsAnalyticsView;