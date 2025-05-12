export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  insuranceStatus: 'verified' | 'pending' | 'expired' | 'none';
}

export interface SearchResults<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PatientSearchResults extends SearchResults<Patient> {
  query: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  color: string;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
}

export interface Location {
  id: string;
  name: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  locationId: string;
  locationName: string;
  operatoryId: string;
  operatoryName: string;
  appointmentTypeId: string;
  appointmentTypeName: string;
  appointmentTypeColor: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'arrived' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  insuranceVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSearchResults extends SearchResults<Appointment> {
  query: string;
}