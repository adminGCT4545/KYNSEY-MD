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
    const mockPatients: Patient[] = [
      {
        patient_id: '101',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1985-06-15',
        gender: 'Male'
      },
      {
        patient_id: '102',
        first_name: 'Jane',
        last_name: 'Smith',
        date_of_birth: '1990-03-20',
        gender: 'Female'
      }
    ];
    return Promise.resolve({ data: mockPatients });
  }

  async getPatient(patientId: string) {
    const mockPatient: Patient = {
      patient_id: patientId,
      first_name: 'Jane',
      last_name: 'Smith',
      date_of_birth: '1985-06-15',
      gender: 'Female',
      email: 'jane.smith@example.com',
      phone: '(555) 123-4567',
      address: '123 Main Street',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
      insurance_provider: 'Blue Cross Blue Shield',
      insurance_policy_number: 'BCBS12345678',
      insurance_group_number: 'G9876543',
      primary_care_provider: 'Dr. Robert Johnson',
      emergency_contact_name: 'John Smith',
      emergency_contact_phone: '(555) 987-6543',
      allergies: ['Penicillin', 'Peanuts'],
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          start_date: '2023-01-15'
        }
      ],
      medical_history: [
        {
          condition: 'Hypertension',
          diagnosed_date: '2022-12-10',
          notes: 'Mild. Controlled with medication.'
        }
      ]
    };
    return Promise.resolve({ data: mockPatient });
  }

  async getAppointments(filters?: any) {
    const mockAppointments: AppointmentData[] = [
      {
        id: '1',
        patientId: '101',
        date: '2025-05-08',
        time: '09:00',
        type: 'Check-up',
        status: 'Scheduled',
        notes: 'Regular check-up'
      },
      {
        id: '2',
        patientId: '102',
        date: '2025-05-08',
        time: '10:00',
        type: 'Follow-up',
        status: 'Completed',
        notes: 'Follow-up after treatment'
      }
    ];
    return Promise.resolve({ data: mockAppointments });
  }

  async getReportData(params: {
    reportType: keyof ReportData;
    startDate?: string;
    endDate?: string;
    location?: string;
  }) {
    const mockData: ReportData = {
      financial: {
        revenue: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [
            {
              label: 'Revenue',
              data: [12500, 15200, 18900, 17500, 21000],
              backgroundColor: '#4caf50'
            }
          ]
        }
      },
      demographics: {
        ageDistribution: {
          labels: ['0-17', '18-34', '35-50', '51-65', '66+'],
          data: [15, 22, 28, 20, 15],
          backgroundColor: ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3']
        }
      },
      appointments: {
        byType: {
          labels: ['Check-up', 'Follow-up', 'Emergency', 'Procedure'],
          data: [45, 30, 15, 10],
          backgroundColor: ['#4caf50', '#2196f3', '#f44336', '#ff9800']
        }
      },
      claims: {
        byStatus: {
          labels: ['Approved', 'Pending', 'Denied'],
          data: [70, 20, 10],
          backgroundColor: ['#4caf50', '#ff9800', '#f44336']
        }
      }
    };
    return Promise.resolve({ data: mockData[params.reportType] });
  }

  // Mock implementations for other methods that return empty success responses
  async createPatient(patientData: any) { return Promise.resolve({ data: { success: true } }); }
  async updatePatient(patientData: any) { return Promise.resolve({ data: { success: true } }); }
  async deletePatient(patientId: string) { return Promise.resolve({ data: { success: true } }); }
  async getAppointment(appointmentId: string) { return Promise.resolve({ data: { success: true } }); }
  async createAppointment(appointmentData: any) { return Promise.resolve({ data: { success: true } }); }
  async updateAppointment(appointmentData: any) { return Promise.resolve({ data: { success: true } }); }
  async deleteAppointment(appointmentId: string) { return Promise.resolve({ data: { success: true } }); }
  async getPatientCharts(patientId: string) { return Promise.resolve({ data: [] }); }
  async getChart(chartId: string) { return Promise.resolve({ data: { success: true } }); }
  async createChartEntry(chartData: any) { return Promise.resolve({ data: { success: true } }); }
  async updateChartEntry(chartData: any) { return Promise.resolve({ data: { success: true } }); }
  async getPatientHistory(patientId: string) { return Promise.resolve({ data: [] }); }
  async getPatientDocuments(patientId: string) { return Promise.resolve({ data: [] }); }
  async uploadDocument(patientId: string, formData: FormData) { return Promise.resolve({ data: { success: true } }); }
  async deleteDocument(documentId: string) { return Promise.resolve({ data: { success: true } }); }
  async getPatientBilling(patientId: string) { return Promise.resolve({ data: [] }); }
  async getClaims(filters?: any) { return Promise.resolve({ data: [] }); }
  async getClaim(claimId: string) { return Promise.resolve({ data: { success: true } }); }
  async createClaim(claimData: any) { return Promise.resolve({ data: { success: true } }); }
  async updateClaim(claimData: any) { return Promise.resolve({ data: { success: true } }); }
  async getLocations() { return Promise.resolve({ data: [] }); }
}

export const medicalService = new MedicalService();
export default medicalService;
