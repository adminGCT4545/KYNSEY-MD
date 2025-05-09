import React, { useState } from 'react';

interface LogEntry {
  id: number;
  timestamp: string;
  logType: string;
  operation: string;
  details: string;
  status: string;
  user: string;
  ipAddress: string;
}

const SystemLogs: React.FC = () => {
  const [logTypeFilter, setLogTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: '',
    end: ''
  });
  
  // Mock log data
  const logs: LogEntry[] = [
    {
      id: 1,
      timestamp: '2025-04-28 12:45:32',
      logType: 'QUERY',
      operation: 'SELECT',
      details: 'SELECT * FROM train_journeys WHERE journey_date > \'2025-04-01\'',
      status: 'SUCCESS',
      user: 'admin',
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      timestamp: '2025-04-28 12:43:15',
      logType: 'CONNECTION',
      operation: 'CONNECT',
      details: 'Connected to database: pgsql:host=localhost;port=5432;dbname=booksl_train',
      status: 'SUCCESS',
      user: 'admin',
      ipAddress: '192.168.1.100'
    },
    {
      id: 3,
      timestamp: '2025-04-28 12:40:22',
      logType: 'QUERY',
      operation: 'UPDATE',
      details: 'UPDATE train_schedules SET scheduled_time = \'08:30:00\' WHERE schedule_id = 123',
      status: 'SUCCESS',
      user: 'admin',
      ipAddress: '192.168.1.100'
    },
    {
      id: 4,
      timestamp: '2025-04-28 12:35:18',
      logType: 'QUERY',
      operation: 'INSERT',
      details: 'INSERT INTO train_journeys (train_id, departure_city, arrival_city, journey_date) VALUES (101, \'Colombo\', \'Kandy\', \'2025-05-01\')',
      status: 'SUCCESS',
      user: 'admin',
      ipAddress: '192.168.1.100'
    },
    {
      id: 5,
      timestamp: '2025-04-28 12:30:45',
      logType: 'SYSTEM',
      operation: 'BACKUP',
      details: 'Database backup completed successfully',
      status: 'SUCCESS',
      user: 'system',
      ipAddress: '127.0.0.1'
    },
    {
      id: 6,
      timestamp: '2025-04-28 12:25:10',
      logType: 'QUERY',
      operation: 'DELETE',
      details: 'DELETE FROM train_journeys WHERE journey_id = 456',
      status: 'FAILURE',
      user: 'admin',
      ipAddress: '192.168.1.100'
    },
    {
      id: 7,
      timestamp: '2025-04-28 12:20:33',
      logType: 'SYSTEM',
      operation: 'MAINTENANCE',
      details: 'Scheduled system maintenance started',
      status: 'SUCCESS',
      user: 'system',
      ipAddress: '127.0.0.1'
    },
    {
      id: 8,
      timestamp: '2025-04-28 12:15:22',
      logType: 'CONNECTION',
      operation: 'DISCONNECT',
      details: 'Disconnected from database: pgsql:host=localhost;port=5432;dbname=booksl_train',
      status: 'SUCCESS',
      user: 'admin',
      ipAddress: '192.168.1.100'
    },
    {
      id: 9,
      timestamp: '2025-04-28 12:10:05',
      logType: 'QUERY',
      operation: 'SELECT',
      details: 'SELECT COUNT(*) FROM train_journeys GROUP BY train_id',
      status: 'SUCCESS',
      user: 'admin',
      ipAddress: '192.168.1.100'
    },
    {
      id: 10,
      timestamp: '2025-04-28 12:05:18',
      logType: 'SYSTEM',
      operation: 'ERROR',
      details: 'Failed to connect to payment gateway service',
      status: 'FAILURE',
      user: 'system',
      ipAddress: '127.0.0.1'
    }
  ];
  
  // Filter logs based on selected filters
  const filteredLogs = logs.filter(log => {
    const matchesLogType = logTypeFilter === 'all' || log.logType === logTypeFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesSearch = 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDateRange = true;
    if (dateRange.start && dateRange.end) {
      const logDate = new Date(log.timestamp);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDateRange = logDate >= startDate && logDate <= endDate;
    }
    
    return matchesLogType && matchesStatus && matchesSearch && matchesDateRange;
  });
  
  // Get unique log types for filter dropdown
  const logTypes = Array.from(new Set(logs.map(log => log.logType)));
  
  return (
    <div className="p-4">
      <div className="mb-4 px-2">
        <h1 className="text-xl font-medium text-dashboard-header">System Logs</h1>
        <p className="text-dashboard-subtext mt-1">View and analyze system activity and database operations.</p>
      </div>
      
      {/* Filters */}
      <div className="bg-dashboard-panel rounded shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="logTypeFilter" className="block text-dashboard-subtext mb-1 text-sm">Log Type</label>
            <select
              id="logTypeFilter"
              className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-3 py-2"
              value={logTypeFilter}
              onChange={(e) => setLogTypeFilter(e.target.value)}
            >
              <option value="all">All Log Types</option>
              {logTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-dashboard-subtext mb-1 text-sm">Status</label>
            <select
              id="statusFilter"
              className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILURE">Failure</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dateRangeStart" className="block text-dashboard-subtext mb-1 text-sm">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                id="dateRangeStart"
                className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-3 py-2"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
              <input
                type="date"
                id="dateRangeEnd"
                className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-3 py-2"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="searchTerm" className="block text-dashboard-subtext mb-1 text-sm">Search</label>
            <div className="relative">
              <input
                type="text"
                id="searchTerm"
                placeholder="Search logs..."
                className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-4 py-2 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-dashboard-subtext" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-dashboard-subtext text-sm">
            {filteredLogs.length} logs found
          </div>
          <div className="flex space-x-2">
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export Logs
            </button>
            <button className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Logs
            </button>
          </div>
        </div>
      </div>
      
      {/* Log Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dashboard-panel rounded shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-dashboard-subtext">Total Logs</p>
              <h3 className="text-2xl font-medium text-dashboard-header mt-1">{logs.length}</h3>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dashboard-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-dashboard-panel rounded shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-dashboard-subtext">Query Logs</p>
              <h3 className="text-2xl font-medium text-dashboard-header mt-1">
                {logs.filter(log => log.logType === 'QUERY').length}
              </h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-dashboard-panel rounded shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-dashboard-subtext">System Logs</p>
              <h3 className="text-2xl font-medium text-dashboard-header mt-1">
                {logs.filter(log => log.logType === 'SYSTEM').length}
              </h3>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-dashboard-panel rounded shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-dashboard-subtext">Error Logs</p>
              <h3 className="text-2xl font-medium text-dashboard-header mt-1">
                {logs.filter(log => log.status === 'FAILURE').length}
              </h3>
            </div>
            <div className="bg-red-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Logs Table */}
      <div className="bg-dashboard-panel rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-dashboard-text">
            <thead className="bg-dashboard-dark border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-4">Timestamp</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Operation</th>
                <th className="text-left py-3 px-4">Details</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-700 hover:bg-dashboard-dark">
                    <td className="py-3 px-4 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.logType === 'QUERY' 
                          ? 'bg-blue-900 text-blue-300' 
                          : log.logType === 'SYSTEM'
                            ? 'bg-green-900 text-green-300'
                            : 'bg-purple-900 text-purple-300'
                      }`}>
                        {log.logType}
                      </span>
                    </td>
                    <td className="py-3 px-4">{log.operation}</td>
                    <td className="py-3 px-4">
                      <div className="max-w-md truncate" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.status === 'SUCCESS' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{log.user}</td>
                    <td className="py-3 px-4">{log.ipAddress}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-dashboard-subtext">
                    No logs found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          <div className="text-dashboard-subtext text-sm">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
          <div className="flex space-x-1">
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">
              Previous
            </button>
            <button className="bg-dashboard-purple hover:bg-purple-700 text-white px-3 py-1 rounded">
              1
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">
              2
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">
              3
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
