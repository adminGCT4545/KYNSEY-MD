import axios from 'axios';

// API base URL - should match your backend server config
const API_BASE_URL = 'http://localhost:8888';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PatientFilters {
  searchTerm?: string;
  insuranceProvider?: string;
  status?: string;
  sortBy?: string;
  limit?: number;
  page?: number;
}

export interface Insurance {
  id: number;
  provider: string;
  policy_number: string;
  group_number: string;
  subscriber_name: string;
  relationship_to_subscriber: string;
  coverage_start_date: string;
  coverage_end_date?: string;
  is_primary: boolean;
}

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  status: 'active' | 'inactive' | 'archived';
  notes?: string;
  insurance?: Insurance[];
  primary_provider_id?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  allergies?: string[];
  created_at: string;
  updated_at: string;
}

class PatientService {
  /**
   * Get all patients with optional filtering
   */
  async getPatients(filters: PatientFilters = {}) {
    try {
      const response = await apiClient.get('/api/medical/patients', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  /**
   * Get a single patient by ID
   */
  async getPatientById(id: number): Promise<Patient> {
    try {
      const response = await apiClient.get(`/api/medical/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new patient
   */
  async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    try {
      const response = await apiClient.post('/api/medical/patients', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  /**
   * Update an existing patient
   */
  async updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient> {
    try {
      const response = await apiClient.put(`/api/medical/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      console.error(`Error updating patient ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a patient (usually just marks as inactive rather than true deletion)
   */
  async deletePatient(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/medical/patients/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting patient ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search patients by term (name, phone, email, etc)
   */
  async searchPatients(searchTerm: string) {
    try {
      return this.getPatients({ searchTerm });
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  /**
   * Get all appointments for a specific patient
   */
  async getPatientAppointments(patientId: number) {
    try {
      const response = await apiClient.get(`/api/medical/patients/${patientId}/appointments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for patient ${patientId}:`, error);
      throw error;
    }
  }
}

export const patientService = new PatientService();
export default patientService;