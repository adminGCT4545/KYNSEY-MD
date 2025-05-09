import React from 'react';

const Reports: React.FC = () => {
  return (
    <div className="p-4">
      <div className="mb-4 px-2">
        <h1 className="text-xl font-medium text-dashboard-header">Reports</h1>
        <p className="text-dashboard-subtext mt-1">View and generate reports for train operations and performance.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue Reports */}
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-4">Revenue Reports</h2>
          <div className="space-y-3">
            <div className="bg-dashboard-dark rounded p-3 flex items-center hover:bg-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-dashboard-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div>
                <div className="text-dashboard-header">Monthly Revenue Report</div>
                <div className="text-dashboard-subtext text-sm">Revenue breakdown by train, route, and class</div>
              </div>
            </div>
            
            <div className="bg-dashboard-dark rounded p-3 flex items-center hover:bg-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-dashboard-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <div>
                <div className="text-dashboard-header">Revenue Trends</div>
                <div className="text-dashboard-subtext text-sm">Year-over-year revenue comparison</div>
              </div>
            </div>
            
            <div className="bg-dashboard-dark rounded p-3 flex items-center hover:bg-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-dashboard-light-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <div>
                <div className="text-dashboard-header">Revenue by Class</div>
                <div className="text-dashboard-subtext text-sm">Breakdown of revenue by ticket class</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Performance Reports */}
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-4">Performance Reports</h2>
          <div className="space-y-3">
            <div className="bg-dashboard-dark rounded p-3 flex items-center hover:bg-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-dashboard-header">On-Time Performance</div>
                <div className="text-dashboard-subtext text-sm">Analysis of delays and on-time arrivals</div>
              </div>
            </div>
            
            <div className="bg-dashboard-dark rounded p-3 flex items-center hover:bg-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <div className="text-dashboard-header">Efficiency Report</div>
                <div className="text-dashboard-subtext text-sm">Fuel consumption and operational efficiency</div>
              </div>
            </div>
            
            <div className="bg-dashboard-dark rounded p-3 flex items-center hover:bg-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <div className="text-dashboard-header">Incident Report</div>
                <div className="text-dashboard-subtext text-sm">Summary of operational incidents and resolutions</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Occupancy Reports */}
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-4">Occupancy Reports</h2>
          <div className="space-y-3">
            <div className="bg-dashboard-dark rounded p-3 flex items-center hover:bg-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <div className="text-dashboard-header">Passenger Load Factor</div>
                <div className="text-dashboard-subtext text-sm">Occupancy rates by train and route</div>
              </div>
            </div>
            
            <div className="bg-dashboard-dark rounded p-3 flex items-center hover:bg-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="text-dashboard-header">Seasonal Trends</div>
                <div className="text-dashboard-subtext text-sm">Occupancy patterns by season and holiday</div>
              </div>
            </div>
            
            <div className="bg-dashboard-dark rounded p-3 flex items-center hover:bg-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div>
                <div className="text-dashboard-header">Class Utilization</div>
                <div className="text-dashboard-subtext text-sm">Occupancy breakdown by ticket class</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Schedule Reports */}
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-4">Schedule Reports</h2>
          <div className="space-y-3">
            <div className="bg-dashboard-dark rounded p-3 flex items-center hover:bg-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <div className="text-dashboard-header">Route Performance</div>
                <div className="text-dashboard-subtext text-sm">Analysis of route efficiency and utilization</div>
              </div>
            </div>
            
            <div className="bg-dashboard-dark rounded p-3 flex items-center hover:bg-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-dashboard-header">Delay Analysis</div>
                <div className="text-dashboard-subtext text-sm">Detailed breakdown of delay causes and patterns</div>
              </div>
            </div>
            
            <div className="bg-dashboard-dark rounded p-3 flex items-center hover:bg-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <div className="text-dashboard-header">Schedule Optimization</div>
                <div className="text-dashboard-subtext text-sm">Recommendations for schedule improvements</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
