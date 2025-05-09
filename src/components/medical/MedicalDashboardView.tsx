// filepath: /home/gct-coder-01/Documents/KYNSEY MD/Timewise_Procurement-nightly/src/components/medical/MedicalDashboardView.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';

/**
 * MedicalDashboardView Component
 * 
 * Main dashboard for the medical module
 */
const MedicalDashboardView: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
    pendingClaims: 0,
    recentReports: 0
  });

  // Mocked data for demonstration
  useEffect(() => {
    // In a real app, this would fetch actual data from an API
    setTimeout(() => {
      setSummary({
        totalPatients: 1583,
        appointmentsToday: 42,
        pendingClaims: 78,
        recentReports: 12
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const modules = [
    {
      title: "Patient Management",
      description: "Manage patient information, profiles, and medical history",
      icon: "👥",
      link: "/medical/patients",
      color: "bg-blue-500"
    },
    {
      title: "Daily Schedule",
      description: "View and manage today's appointments and patient schedule",
      icon: "📅",
      link: "/medical/daily",
      color: "bg-green-500"
    },
    {
      title: "Reports & Analytics",
      description: "Access reports and data analytics for clinical and financial insights",
      icon: "📊",
      link: "/medical/reports",
      color: "bg-purple-500"
    },
    {
      title: "Billing & Claims",
      description: "Manage insurance claims, billing information, and payment status",
      icon: "💵",
      link: "/medical/billing",
      color: "bg-yellow-500"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Medical ERP Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold">{summary.totalPatients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <span className="text-green-600 text-xl">📅</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Today's Appointments</p>
              <p className="text-2xl font-bold">{summary.appointmentsToday}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-3 mr-4">
              <span className="text-yellow-600 text-xl">💵</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Claims</p>
              <p className="text-2xl font-bold">{summary.pendingClaims}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <span className="text-purple-600 text-xl">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Recent Reports</p>
              <p className="text-2xl font-bold">{summary.recentReports}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module, index) => (
          <Link 
            key={index}
            to={module.link}
            className="bg-white rounded-lg shadow transition-transform hover:scale-[1.02] hover:shadow-lg"
          >
            <div className="flex items-start p-6">
              <div className={`${module.color} text-white rounded-full p-4 mr-4`}>
                <span className="text-2xl">{module.icon}</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {module.title}
                </h3>
                <p className="text-gray-600">
                  {module.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Quick Actions Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition">
              <span className="text-2xl mb-2">➕</span>
              <span className="text-sm font-medium">New Patient</span>
            </button>
            
            <button className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition">
              <span className="text-2xl mb-2">📝</span>
              <span className="text-sm font-medium">New Appointment</span>
            </button>
            
            <button className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition">
              <span className="text-2xl mb-2">📄</span>
              <span className="text-sm font-medium">Create Claim</span>
            </button>
            
            <button className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition">
              <span className="text-2xl mb-2">🔍</span>
              <span className="text-sm font-medium">Search Records</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalDashboardView;