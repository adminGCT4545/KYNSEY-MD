// Export all medical components for easier imports
export { default as MedicalLayout } from './MedicalLayout';
export { default as TopNavBar } from './TopNavBar';
export { default as MainSideBar } from './MainSideBar';
export { default as DailySchedulerView } from './DailySchedulerView';
export { default as AppointmentCard } from './AppointmentCard';
export { default as LocationSelector } from './LocationSelector';
export { default as DateNavigator } from './DateNavigator';
export { default as StatusFilter } from './StatusFilter';
export { default as PatientManagementView } from './PatientManagementView';
export { default as PatientSearchBar } from './PatientSearchBar';
export { default as PatientList } from './PatientList';
export { default as PatientQuickView } from './PatientQuickView';
export { default as BillingClaimsView } from './BillingClaimsView';

// No need to export types from here as they're now defined in medicalService.ts
