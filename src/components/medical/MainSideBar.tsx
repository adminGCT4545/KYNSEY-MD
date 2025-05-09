import React from 'react';

interface MainSideBarProps {
  activeTab: string;
}

const MainSideBar: React.FC<MainSideBarProps> = ({ activeTab }) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* KYNSEY MD LLM Assistant Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg mb-6 flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          KYNSEY MD
        </button>

        {/* Sidebar Navigation */}
        <nav className="space-y-1">
          <SidebarLink 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            } 
            label="Patient Base" 
            active={activeTab === 'patients'} 
          />
          <SidebarLink 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            } 
            label="Clinical Notes" 
            active={activeTab === 'notes'} 
          />
          <SidebarLink 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            } 
            label="Documents" 
            active={activeTab === 'documents'} 
          />
          <SidebarLink 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            } 
            label="Billing" 
            active={activeTab === 'billing'} 
          />
          <SidebarLink 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            } 
            label="Calendar" 
            active={activeTab === 'calendar'} 
          />
        </nav>
      </div>

      {/* Production/Collections Section */}
      <div className="mt-6 p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Today's Performance
        </h3>
        
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Production</p>
            <div className="mt-1 relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                <div className="w-3/4 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              </div>
              <p className="text-right text-xs font-medium text-gray-600 mt-1">$8,250 / $11,000</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">Collections</p>
            <div className="mt-1 relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100">
                <div className="w-1/2 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
              </div>
              <p className="text-right text-xs font-medium text-gray-600 mt-1">$5,500 / $11,000</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">Completed Visits</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">18 / 24</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Helper component for sidebar links
interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, active }) => {
  return (
    <a
      href="#"
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className={`mr-3 ${active ? 'text-blue-500' : 'text-gray-500'}`}>
        {icon}
      </span>
      {label}
    </a>
  );
};

export default MainSideBar;
