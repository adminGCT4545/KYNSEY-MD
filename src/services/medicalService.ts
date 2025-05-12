import axios from 'axios';

// API base URL - Updated to use the correct port from your backend server
const API_BASE_URL = 'http://localhost:8888'; // This should match your backend's port from server.js

// Create axios instance
// Create axios instance with retries and timeout
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add retry logic
apiClient.interceptors.response.use(undefined, async (error) => {
  if (error.config && error.config.__retryCount < 2) {
    error.config.__retryCount = error.config.__retryCount || 0;
    error.config.__retryCount++;

    // Exponential backoff
    const backoff = Math.pow(2, error.config.__retryCount) * 1000;
    await new Promise(resolve => setTimeout(resolve, backoff));

    return apiClient(error.config);
  }
  
  // Parse error for more specific messages
  const errorMessage = error.response?.data?.message || error.message;
  const statusCode = error.response?.status;
  const enhancedError = new Error(errorMessage);
  (enhancedError as any).statusCode = statusCode;
  (enhancedError as any).originalError = error;
  
  throw enhancedError;
});

interface Patient {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_group_number?: string;
  primary_care_provider?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  allergies?: string[];
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    start_date: string;
  }>;
  medical_history?: Array<{
    condition: string;
    diagnosed_date: string;
    notes: string;
  }>;
}

interface AppointmentData {
  id: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes?: string;
}

interface ChartData {
  id: string;
  patientId: string;
  date: string;
  type: string;
  notes: string;
}

// New interface for vital signs - updated to match the component's expectations
interface VitalSign {
  id?: string;
  patient_id: string;
  date: string;
  vital_type: string;  // Changed from type to vital_type to match component
  value: number;
  unit: string;
  notes?: string;
  recorded_by?: string;
  recorded_at?: string;
}

interface ReportData {
  financial: {
    revenue: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string;
      }>;
    };
  };
  demographics: {
    ageDistribution: {
      labels: string[];
      data: number[];
      backgroundColor: string[];
    };
  };
  appointments: {
    byType: {
      labels: string[];
      data: number[];
      backgroundColor: string[];
    };
  };
  claims: {
    byStatus: {
      labels: string[];
      data: number[];
      backgroundColor: string[];
    };
  };
}

class MedicalService {
  async getPatients(filters?: any) {
    try {
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      const response = await apiClient.get('/api/medical/patients', { params: filters });
      return response;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  async getPatientById(patientId: string) {
    try {
      const response = await apiClient.get(`/api/medical/patients/${patientId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching patient ${patientId}:`, error);
      throw error;
    }
  }

  // Alias for getPatient to maintain backward compatibility
  async getPatient(patientId: string) {
    return this.getPatientById(patientId);
  }

  async createPatient(patientData: any) {
    try {
      const response = await apiClient.post('/api/medical/patients', patientData);
      return response;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async updatePatient(patientData: any) {
    try {
      const response = await apiClient.put(`/api/medical/patients/${patientData.patient_id}`, patientData);
      return response;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async deletePatient(patientId: string) {
    try {
      const response = await apiClient.delete(`/api/medical/patients/${patientId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting patient ${patientId}:`, error);
      throw error;
    }
  }

  async getAppointments(filters?: any) {
    try {
      const response = await apiClient.get('/api/medical/appointments', { params: filters });
      return response;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  async getAppointment(appointmentId: string) {
    try {
      const response = await apiClient.get(`/api/medical/appointments/${appointmentId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching appointment ${appointmentId}:`, error);
      throw error;
    }
  }

  async createAppointment(appointmentData: any) {
    try {
      const response = await apiClient.post('/api/medical/appointments', appointmentData);
      return response;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(appointmentData: any) {
    try {
      const response = await apiClient.put(`/api/medical/appointments/${appointmentData.id}`, appointmentData);
      return response;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  async deleteAppointment(appointmentId: string) {
    try {
      const response = await apiClient.delete(`/api/medical/appointments/${appointmentId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting appointment ${appointmentId}:`, error);
      throw error;
    }
  }

  async getReportData(params: {
    reportType: keyof ReportData;
    startDate?: string;
    endDate?: string;
    location?: string;
  }) {
    try {
      const response = await apiClient.get('/api/medical/reports', { params });
      return response;
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  }

  async getPatientChart(patientId: string) {
    try {
      const response = await apiClient.get(`/api/medical/patients/${patientId}/charts`);
      return response;
    } catch (error) {
      console.error(`Error fetching charts for patient ${patientId}:`, error);
      throw error;
    }
  }

  // Keep the original method for backward compatibility
  async getPatientCharts(patientId: string) {
    return this.getPatientChart(patientId);
  }

  async getChart(chartId: string) {
    try {
      const response = await apiClient.get(`/api/medical/charts/${chartId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching chart ${chartId}:`, error);
      throw error;
    }
  }

  async createChartEntry(chartData: any) {
    try {
      const response = await apiClient.post('/api/medical/charts', chartData);
      return response;
    } catch (error) {
      console.error('Error creating chart entry:', error);
      throw error;
    }
  }

  async updateChartEntry(chartData: any) {
    try {
      const response = await apiClient.put(`/api/medical/charts/${chartData.id}`, chartData);
      return response;
    } catch (error) {
      console.error('Error updating chart entry:', error);
      throw error;
    }
  }

  async getPatientHistory(patientId: string) {
    try {
      const response = await apiClient.get(`/api/medical/patients/${patientId}/history`);
      return response;
    } catch (error) {
      console.error(`Error fetching history for patient ${patientId}:`, error);
      throw error;
    }
  }

  async getPatientDocuments(patientId: string) {
    try {
      const response = await apiClient.get(`/api/medical/patients/${patientId}/documents`);
      return response;
    } catch (error) {
      console.error(`Error fetching documents for patient ${patientId}:`, error);
      throw error;
    }
  }

  async uploadDocument(patientId: string, formData: FormData) {
    try {
      const response = await apiClient.post(`/api/medical/patients/${patientId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error(`Error uploading document for patient ${patientId}:`, error);
      throw error;
    }
  }

  async deleteDocument(documentId: string) {
    try {
      const response = await apiClient.delete(`/api/medical/documents/${documentId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting document ${documentId}:`, error);
      throw error;
    }
  }

  async getPatientBilling(patientId: string) {
    try {
      const response = await apiClient.get(`/api/medical/patients/${patientId}/billing`);
      return response;
    } catch (error) {
      console.error(`Error fetching billing for patient ${patientId}:`, error);
      throw error;
    }
  }

  async getClaims(filters?: any) {
    try {
      const response = await apiClient.get('/api/medical/claims', { params: filters });
      return response;
    } catch (error) {
      console.error('Error fetching claims:', error);
      throw error;
    }
  }

  async getClaim(claimId: string) {
    try {
      const response = await apiClient.get(`/api/medical/claims/${claimId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching claim ${claimId}:`, error);
      throw error;
    }
  }

  async createClaim(claimData: any) {
    try {
      const response = await apiClient.post('/api/medical/claims', claimData);
      return response;
    } catch (error) {
      console.error('Error creating claim:', error);
      throw error;
    }
  }

  async updateClaim(claimData: any) {
    try {
      const response = await apiClient.put(`/api/medical/claims/${claimData.id}`, claimData);
      return response;
    } catch (error) {
      console.error('Error updating claim:', error);
      throw error;
    }
  }

  async getLocations() {
    try {
      const response = await apiClient.get('/api/medical/locations');
      return response;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  // New methods for vital signs - updated to properly handle the interface
  async getVitalSigns(patientId: string) {
    try {
      const response = await apiClient.get(`/api/medical/patients/${patientId}/vital-signs`);
      return response;
    } catch (error) {
      console.error(`Error fetching vital signs for patient ${patientId}:`, error);
      throw error;
    }
  }

  async createVitalSign(patientId: string, data: VitalSign) {
    try {
      const response = await apiClient.post(`/api/medical/patients/${patientId}/vital-signs`, data);
      return response;
    } catch (error) {
      console.error(`Error creating vital sign for patient ${patientId}:`, error);
      throw error;
    }
  }

  async updateVitalSign(patientId: string, vitalSignId: string, data: VitalSign) {
    try {
      const response = await apiClient.put(`/api/medical/patients/${patientId}/vital-signs/${vitalSignId}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating vital sign ${vitalSignId} for patient ${patientId}:`, error);
      throw error;
    }
  }

  async deleteVitalSign(patientId: string, vitalSignId: string) {
    try {
      const response = await apiClient.delete(`/api/medical/patients/${patientId}/vital-signs/${vitalSignId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting vital sign ${vitalSignId} for patient ${patientId}:`, error);
      throw error;
    }
  }
}

export const medicalService = new MedicalService();
export default medicalService;
