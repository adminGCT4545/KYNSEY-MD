import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MedicalLayout from '@components/medical/MedicalLayout';
import './index.css';

// Lazy load medical module components
const MedicalModule = React.lazy(() => import('./modules/MedicalModule'));
const ReportsAnalyticsView = React.lazy(() => import('@medical/ReportsAnalyticsView'));
const PatientManagementView = React.lazy(() => import('@medical/PatientManagementView'));
const PatientProfileView = React.lazy(() => import('@medical/PatientProfileView'));
const BillingClaimsView = React.lazy(() => import('@medical/BillingClaimsView'));
const MedicalDashboardView = React.lazy(() => import('@medical/MedicalDashboardView'));
const ProductionTrackingView = React.lazy(() => import('@medical/ProductionTrackingView'));
// Import ChartsView using the index file approach
const ChartsView = React.lazy(() => import('@medical').then(module => ({ default: module.ChartsView })));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
        {/* KYNSEY MD Routes */}
        <Route path="/" element={
          <MedicalLayout title="KYNSEY MD - Medical Dashboard">
            <MedicalDashboardView />
          </MedicalLayout>
        } />
        <Route path="/medical" element={
          <MedicalLayout title="KYNSEY MD - Medical Dashboard">
            <MedicalDashboardView />
          </MedicalLayout>
        } />
        <Route path="/medical/daily" element={
          <MedicalLayout title="KYNSEY MD - Daily Schedule">
            <MedicalModule />
          </MedicalLayout>
        } />
        <Route path="/medical/reports" element={
          <MedicalLayout title="KYNSEY MD - Reports & Analytics">
            <ReportsAnalyticsView />
          </MedicalLayout>
        } />
        <Route path="/medical/production" element={
          <MedicalLayout title="KYNSEY MD - Production Tracking">
            <ProductionTrackingView />
          </MedicalLayout>
        } />
        <Route path="/medical/patients" element={
          <MedicalLayout title="KYNSEY MD - Patient Management">
            <PatientManagementView />
          </MedicalLayout>
        } />
        <Route path="/medical/patients/:patientId" element={
          <MedicalLayout title="KYNSEY MD - Patient Profile">
            <PatientProfileView />
          </MedicalLayout>
        } />
        <Route path="/medical/billing" element={
          <MedicalLayout title="KYNSEY MD - Billing & Claims">
            <BillingClaimsView />
          </MedicalLayout>
        } />
        <Route path="/medical/charts" element={
          <MedicalLayout title="KYNSEY MD - Medical Charts">
            <ChartsView />
          </MedicalLayout>
        } />
        {/* Additional medical routes will be added here as they are developed */}
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
