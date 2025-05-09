import React, { useState } from 'react';

const ErpModeling: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dataModel');
  
  return (
    <div className="p-4">
      <div className="mb-4 px-2">
        <h1 className="text-xl font-medium text-dashboard-header">ERP Modeling</h1>
        <p className="text-dashboard-subtext mt-1">Enterprise Resource Planning modeling and data structure visualization.</p>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-700">
        <div className="flex">
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'dataModel' ? 'text-dashboard-purple border-b-2 border-dashboard-purple' : 'text-dashboard-subtext'}`}
            onClick={() => setActiveTab('dataModel')}
          >
            Data Model
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'processFlow' ? 'text-dashboard-purple border-b-2 border-dashboard-purple' : 'text-dashboard-subtext'}`}
            onClick={() => setActiveTab('processFlow')}
          >
            Process Flow
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'integration' ? 'text-dashboard-purple border-b-2 border-dashboard-purple' : 'text-dashboard-subtext'}`}
            onClick={() => setActiveTab('integration')}
          >
            Integration
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'documentation' ? 'text-dashboard-purple border-b-2 border-dashboard-purple' : 'text-dashboard-subtext'}`}
            onClick={() => setActiveTab('documentation')}
          >
            Documentation
          </button>
        </div>
      </div>
      
      {/* Data Model Tab */}
      {activeTab === 'dataModel' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-dashboard-panel rounded shadow p-4 lg:col-span-2">
              <h2 className="text-dashboard-header text-lg mb-4">Entity Relationship Diagram</h2>
              <div className="bg-dashboard-dark rounded p-4 h-96 flex items-center justify-center">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-dashboard-subtext mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <p className="text-dashboard-subtext">Entity Relationship Diagram will be displayed here</p>
                  <button className="mt-4 bg-dashboard-purple hover:bg-purple-700 text-white px-4 py-2 rounded">
                    Generate ERD
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-dashboard-panel rounded shadow p-4">
              <h2 className="text-dashboard-header text-lg mb-4">Entities</h2>
              <div className="space-y-2">
                <div className="bg-dashboard-dark rounded p-3 hover:bg-gray-700 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="text-dashboard-header">Trains</div>
                    <div className="text-dashboard-subtext text-sm">12 attributes</div>
                  </div>
                </div>
                <div className="bg-dashboard-dark rounded p-3 hover:bg-gray-700 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="text-dashboard-header">Train Schedules</div>
                    <div className="text-dashboard-subtext text-sm">8 attributes</div>
                  </div>
                </div>
                <div className="bg-dashboard-dark rounded p-3 hover:bg-gray-700 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="text-dashboard-header">Train Journeys</div>
                    <div className="text-dashboard-subtext text-sm">15 attributes</div>
                  </div>
                </div>
                <div className="bg-dashboard-dark rounded p-3 hover:bg-gray-700 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="text-dashboard-header">Passengers</div>
                    <div className="text-dashboard-subtext text-sm">10 attributes</div>
                  </div>
                </div>
                <div className="bg-dashboard-dark rounded p-3 hover:bg-gray-700 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="text-dashboard-header">Tickets</div>
                    <div className="text-dashboard-subtext text-sm">14 attributes</div>
                  </div>
                </div>
                <div className="bg-dashboard-dark rounded p-3 hover:bg-gray-700 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="text-dashboard-header">Stations</div>
                    <div className="text-dashboard-subtext text-sm">7 attributes</div>
                  </div>
                </div>
                <div className="bg-dashboard-dark rounded p-3 hover:bg-gray-700 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="text-dashboard-header">Routes</div>
                    <div className="text-dashboard-subtext text-sm">9 attributes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-dashboard-panel rounded shadow p-4">
            <h2 className="text-dashboard-header text-lg mb-4">Data Dictionary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-dashboard-text">
                <thead className="bg-dashboard-dark border-b border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4">Entity</th>
                    <th className="text-left py-3 px-4">Attribute</th>
                    <th className="text-left py-3 px-4">Data Type</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Constraints</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700 hover:bg-dashboard-dark">
                    <td className="py-3 px-4">Trains</td>
                    <td className="py-3 px-4">train_id</td>
                    <td className="py-3 px-4">INTEGER</td>
                    <td className="py-3 px-4">Unique identifier for each train</td>
                    <td className="py-3 px-4">PRIMARY KEY</td>
                  </tr>
                  <tr className="border-b border-gray-700 hover:bg-dashboard-dark">
                    <td className="py-3 px-4">Trains</td>
                    <td className="py-3 px-4">train_name</td>
                    <td className="py-3 px-4">VARCHAR(100)</td>
                    <td className="py-3 px-4">Name of the train</td>
                    <td className="py-3 px-4">NOT NULL</td>
                  </tr>
                  <tr className="border-b border-gray-700 hover:bg-dashboard-dark">
                    <td className="py-3 px-4">Train Schedules</td>
                    <td className="py-3 px-4">schedule_id</td>
                    <td className="py-3 px-4">INTEGER</td>
                    <td className="py-3 px-4">Unique identifier for each schedule</td>
                    <td className="py-3 px-4">PRIMARY KEY</td>
                  </tr>
                  <tr className="border-b border-gray-700 hover:bg-dashboard-dark">
                    <td className="py-3 px-4">Train Schedules</td>
                    <td className="py-3 px-4">train_id</td>
                    <td className="py-3 px-4">INTEGER</td>
                    <td className="py-3 px-4">Reference to the train</td>
                    <td className="py-3 px-4">FOREIGN KEY</td>
                  </tr>
                  <tr className="border-b border-gray-700 hover:bg-dashboard-dark">
                    <td className="py-3 px-4">Train Journeys</td>
                    <td className="py-3 px-4">journey_id</td>
                    <td className="py-3 px-4">INTEGER</td>
                    <td className="py-3 px-4">Unique identifier for each journey</td>
                    <td className="py-3 px-4">PRIMARY KEY</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Process Flow Tab */}
      {activeTab === 'processFlow' && (
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-4">Business Process Flows</h2>
          <div className="bg-dashboard-dark rounded p-4 h-96 flex items-center justify-center">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-dashboard-subtext mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-dashboard-subtext">Process flow diagrams will be displayed here</p>
              <button className="mt-4 bg-dashboard-purple hover:bg-purple-700 text-white px-4 py-2 rounded">
                Generate Process Flow
              </button>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dashboard-dark rounded p-4">
              <h3 className="text-dashboard-header text-md mb-3">Ticket Booking Process</h3>
              <ol className="list-decimal list-inside text-dashboard-subtext space-y-2 pl-2">
                <li>Customer selects route and date</li>
                <li>System checks availability</li>
                <li>Customer selects seats and class</li>
                <li>System calculates fare</li>
                <li>Customer makes payment</li>
                <li>System issues ticket</li>
                <li>Notification sent to customer</li>
              </ol>
            </div>
            
            <div className="bg-dashboard-dark rounded p-4">
              <h3 className="text-dashboard-header text-md mb-3">Schedule Management</h3>
              <ol className="list-decimal list-inside text-dashboard-subtext space-y-2 pl-2">
                <li>Admin creates train schedule</li>
                <li>System validates route and timing</li>
                <li>Schedule is published</li>
                <li>Capacity is allocated</li>
                <li>Pricing rules applied</li>
                <li>Schedule becomes available for booking</li>
              </ol>
            </div>
            
            <div className="bg-dashboard-dark rounded p-4">
              <h3 className="text-dashboard-header text-md mb-3">Revenue Management</h3>
              <ol className="list-decimal list-inside text-dashboard-subtext space-y-2 pl-2">
                <li>System collects sales data</li>
                <li>Revenue is categorized by class and route</li>
                <li>Daily reconciliation process</li>
                <li>Monthly financial reporting</li>
                <li>Trend analysis and forecasting</li>
                <li>Pricing optimization</li>
              </ol>
            </div>
          </div>
        </div>
      )}
      
      {/* Integration Tab */}
      {activeTab === 'integration' && (
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-4">System Integration</h2>
          
          <div className="bg-dashboard-dark rounded p-4 mb-6">
            <h3 className="text-dashboard-header text-md mb-3">Integration Architecture</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-dashboard-subtext mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <p className="text-dashboard-subtext">Integration architecture diagram will be displayed here</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-dashboard-header text-md mb-3">Connected Systems</h3>
              <div className="space-y-2">
                <div className="bg-dashboard-dark rounded p-3 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                  <div>
                    <div className="text-dashboard-header">Payment Gateway</div>
                    <div className="text-dashboard-subtext text-sm">Real-time payment processing integration</div>
                  </div>
                </div>
                <div className="bg-dashboard-dark rounded p-3 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                  <div>
                    <div className="text-dashboard-header">SMS Notification Service</div>
                    <div className="text-dashboard-subtext text-sm">Customer alerts and notifications</div>
                  </div>
                </div>
                <div className="bg-dashboard-dark rounded p-3 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                  <div>
                    <div className="text-dashboard-header">Accounting System</div>
                    <div className="text-dashboard-subtext text-sm">Financial data synchronization</div>
                  </div>
                </div>
                <div className="bg-dashboard-dark rounded p-3 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                  <div>
                    <div className="text-dashboard-header">Inventory Management</div>
                    <div className="text-dashboard-subtext text-sm">Train maintenance and parts tracking</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-dashboard-header text-md mb-3">API Documentation</h3>
              <div className="bg-dashboard-dark rounded p-4 h-64 overflow-y-auto">
                <div className="mb-4">
                  <h4 className="text-dashboard-header mb-2">GET /api/trains</h4>
                  <p className="text-dashboard-subtext text-sm mb-2">Retrieves a list of all trains</p>
                  <div className="bg-gray-800 p-2 rounded text-green-400 text-sm font-mono">
                    GET https://api.booksl.com/v1/trains
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-dashboard-header mb-2">GET /api/schedules</h4>
                  <p className="text-dashboard-subtext text-sm mb-2">Retrieves train schedules with optional filters</p>
                  <div className="bg-gray-800 p-2 rounded text-green-400 text-sm font-mono">
                    GET https://api.booksl.com/v1/schedules?date=2025-05-01
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-dashboard-header mb-2">POST /api/bookings</h4>
                  <p className="text-dashboard-subtext text-sm mb-2">Creates a new ticket booking</p>
                  <div className="bg-gray-800 p-2 rounded text-green-400 text-sm font-mono">
                    POST https://api.booksl.com/v1/bookings
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Documentation Tab */}
      {activeTab === 'documentation' && (
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-4">System Documentation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dashboard-dark rounded p-4">
              <h3 className="text-dashboard-header text-md mb-3">User Guides</h3>
              <div className="space-y-2">
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Admin User Guide</span>
                </div>
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Booking Agent Guide</span>
                </div>
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Station Manager Guide</span>
                </div>
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Financial Reports Guide</span>
                </div>
              </div>
            </div>
            
            <div className="bg-dashboard-dark rounded p-4">
              <h3 className="text-dashboard-header text-md mb-3">Technical Documentation</h3>
              <div className="space-y-2">
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>API Documentation</span>
                </div>
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>Database Schema</span>
                </div>
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>System Architecture</span>
                </div>
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>Deployment Guide</span>
                </div>
              </div>
            </div>
            
            <div className="bg-dashboard-dark rounded p-4">
              <h3 className="text-dashboard-header text-md mb-3">Process Documentation</h3>
              <div className="space-y-2">
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Ticket Booking Process</span>
                </div>
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Schedule Management</span>
                </div>
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Revenue Reconciliation</span>
                </div>
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Maintenance Procedures</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErpModeling;
