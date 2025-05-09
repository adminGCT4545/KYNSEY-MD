import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProcurementSchedules from './components/ProcurementSchedules';
import InvoiceIntake from './components/InvoiceIntake';
import AutomatedOrders from './components/AutomatedOrders';
import SupplierManagement from './components/SupplierManagement';
import Membership from './components/Membership';
import Layout from './components/Layout';
import './index.css';

// Import or create placeholder components for the additional pages
import Reports from './components/Reports';
import ErpModeling from './components/ErpModeling';
import SystemLogs from './components/SystemLogs';

// Import medical module components
import DailySchedulerView from './components/medical/DailySchedulerView';
import ReportsAnalyticsView from './components/medical/ReportsAnalyticsView';
import PatientManagementView from './components/medical/PatientManagementView';
import PatientProfileView from './components/medical/PatientProfileView';
import BillingClaimsView from './components/medical/BillingClaimsView';
import MedicalDashboardView from './components/medical/MedicalDashboardView';

function App() {
  return (
    <Router>
      <Routes>
        {/* Procurement ERP Routes */}
        <Route path="/" element={
          <Layout title="Dashboard - TimeWise Procurement">
            <Dashboard />
          </Layout>
        } />
        <Route path="/procurement-schedules" element={
          <Layout title="Procurement Schedules - TimeWise Procurement">
            <ProcurementSchedules />
          </Layout>
        } />
        <Route path="/invoice-intake" element={
          <Layout title="Invoice Intake - TimeWise Procurement">
            <InvoiceIntake />
          </Layout>
        } />
        <Route path="/automated-orders" element={
          <Layout title="Automated Orders - TimeWise Procurement">
            <AutomatedOrders />
          </Layout>
        } />
        <Route path="/supplier-management" element={
          <Layout title="Supplier Management - TimeWise Procurement">
            <SupplierManagement />
          </Layout>
        } />
        <Route path="/reports" element={
          <Layout title="Reports - TimeWise Procurement">
            <Reports />
          </Layout>
        } />
        <Route path="/erp-modeling" element={
          <Layout title="ERP Modeling - TimeWise Procurement">
            <ErpModeling />
          </Layout>
        } />
        <Route path="/system-logs" element={
          <Layout title="System Logs - TimeWise Procurement">
            <SystemLogs />
          </Layout>
        } />
        <Route path="/membership" element={
          <Layout title="Membership Management - TimeWise Procurement">
            <Membership />
          </Layout>
        } />
        
        {/* Medical ERP Routes */}
        <Route path="/medical" element={<MedicalDashboardView />} />
        <Route path="/medical/daily" element={<DailySchedulerView />} />
        <Route path="/medical/reports" element={<ReportsAnalyticsView />} />
        <Route path="/medical/patients" element={<PatientManagementView />} />
        <Route path="/medical/patients/:patientId" element={<PatientProfileView />} />
        <Route path="/medical/billing" element={<BillingClaimsView />} />
        {/* Additional medical routes will be added here as they are developed */}
      </Routes>
    </Router>
  );
}

export default App;
