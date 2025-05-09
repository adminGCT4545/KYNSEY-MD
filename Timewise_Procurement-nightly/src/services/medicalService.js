import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/medical' 
  : 'http://localhost:3001/api/medical';

/**
 * Medical Service
 * 
 * Handles API calls related to the medical module
 */
const medicalService = {
  // Patient Management
  getPatients: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/patients`, { params });
  },
  
  getPatientById: async (patientId) => {
    return axios.get(`${API_BASE_URL}/patients/${patientId}`);
  },
  
  createPatient: async (patientData) => {
    return axios.post(`${API_BASE_URL}/patients`, patientData);
  },
  
  updatePatient: async (patientId, patientData) => {
    return axios.put(`${API_BASE_URL}/patients/${patientId}`, patientData);
  },
  
  deletePatient: async (patientId) => {
    return axios.delete(`${API_BASE_URL}/patients/${patientId}`);
  },
  
  // Patient Medical Records
  getPatientChart: async (patientId) => {
    return axios.get(`${API_BASE_URL}/patients/${patientId}/chart`);
  },
  
  addChartEntry: async (patientId, entryData) => {
    return axios.post(`${API_BASE_URL}/patients/${patientId}/chart`, entryData);
  },
  
  getVitalSigns: async (patientId, params = {}) => {
    return axios.get(`${API_BASE_URL}/patients/${patientId}/vitals`, { params });
  },
  
  addVitalSigns: async (patientId, vitalData) => {
    return axios.post(`${API_BASE_URL}/patients/${patientId}/vitals`, vitalData);
  },
  
  // Patient Timeline
  getPatientTimeline: async (patientId, params = {}) => {
    return axios.get(`${API_BASE_URL}/patients/${patientId}/timeline`, { params });
  },
  
  // Insurance and Billing
  getPatientInsurance: async (patientId) => {
    return axios.get(`${API_BASE_URL}/patients/${patientId}/insurance`);
  },
  
  updatePatientInsurance: async (patientId, insuranceData) => {
    return axios.put(`${API_BASE_URL}/patients/${patientId}/insurance`, insuranceData);
  },
  
  getClaims: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/claims`, { params });
  },
  
  getClaimById: async (claimId) => {
    return axios.get(`${API_BASE_URL}/claims/${claimId}`);
  },
  
  createClaim: async (claimData) => {
    return axios.post(`${API_BASE_URL}/claims`, claimData);
  },
  
  updateClaim: async (claimId, claimData) => {
    return axios.put(`${API_BASE_URL}/claims/${claimId}`, claimData);
  },
  
  // Payments
  getPatientPayments: async (patientId, params = {}) => {
    return axios.get(`${API_BASE_URL}/patients/${patientId}/payments`, { params });
  },
  
  createPayment: async (patientId, paymentData) => {
    return axios.post(`${API_BASE_URL}/patients/${patientId}/payments`, paymentData);
  },
  
  // Appointments
  getAppointments: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/appointments`, { params });
  },
  
  createAppointment: async (appointmentData) => {
    return axios.post(`${API_BASE_URL}/appointments`, appointmentData);
  },
  
  updateAppointment: async (appointmentId, appointmentData) => {
    return axios.put(`${API_BASE_URL}/appointments/${appointmentId}`, appointmentData);
  },
  
  deleteAppointment: async (appointmentId) => {
    return axios.delete(`${API_BASE_URL}/appointments/${appointmentId}`);
  },
  
  // Reporting APIs
  getFinancialReports: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/reports/financial`, { params });
  },
  
  getRevenueByPeriod: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/reports/financial/revenue`, { params });
  },
  
  getClaimAnalytics: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/reports/financial/claims`, { params });
  },
  
  getAccountsReceivable: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/reports/financial/accounts-receivable`, { params });
  },
  
  getProcedureRevenue: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/reports/financial/procedures`, { params });
  },
  
  // Clinical Reports
  getClinicalMetrics: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/reports/clinical`, { params });
  },
  
  getDiagnosisFrequency: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/reports/clinical/diagnoses`, { params });
  },
  
  getProcedureFrequency: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/reports/clinical/procedures`, { params });
  },
  
  getPatientDemographics: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/reports/clinical/demographics`, { params });
  },
  
  // Operational Reports
  getOperationalStats: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/reports/operational`, { params });
  },
  
  getAppointmentMetrics: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/reports/operational/appointments`, { params });
  },
  
  getProviderProductivity: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/reports/operational/providers`, { params });
  },
  
  getLocationMetrics: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/reports/operational/locations`, { params });
  },
  
  // Custom Reports
  generateCustomReport: async (reportParams) => {
    return axios.post(`${API_BASE_URL}/reports/custom`, reportParams);
  },
  
  // Locations
  getLocations: async () => {
    return axios.get(`${API_BASE_URL}/locations`);
  },
  
  // Providers
  getProviders: async (params = {}) => {
    return axios.get(`${API_BASE_URL}/providers`, { params });
  }
};

export default medicalService;