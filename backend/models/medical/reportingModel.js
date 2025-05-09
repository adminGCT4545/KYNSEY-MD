/**
 * Reporting Model
 * Handles data access and business logic for reporting and analytics
 */

const db = require('../../utils/db');
const { sanitizeInput, formatDateRange } = require('../../utils/helpers');

/**
 * Get financial report data for a specified date range and location
 * @param {Object} params - Query parameters
 * @param {Date} params.startDate - Start date for report
 * @param {Date} params.endDate - End date for report
 * @param {String} params.location - Location ID or 'all'
 * @returns {Object} Financial report data
 */
exports.getFinancialReports = async (params) => {
  const { startDate, endDate, location } = params;
  const { formattedStartDate, formattedEndDate } = formatDateRange(startDate, endDate);
  
  try {
    // Base query for all locations or filtered by location
    const locationFilter = location === 'all' ? '' : 'AND l.id = $3';
    
    // Revenue data
    const revenueQuery = `
      SELECT 
        date_trunc('month', pl.transaction_date) AS month,
        SUM(pl.amount) AS revenue,
        SUM(CASE WHEN pl.transaction_type = 'expense' THEN pl.amount ELSE 0 END) AS expenses
      FROM 
        medical_production_log pl
        JOIN medical_locations l ON pl.location_id = l.id
      WHERE 
        pl.transaction_date BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        date_trunc('month', pl.transaction_date)
      ORDER BY 
        month ASC;
    `;
    
    const params = location === 'all' 
      ? [formattedStartDate, formattedEndDate] 
      : [formattedStartDate, formattedEndDate, sanitizeInput(location)];
    
    const revenueResult = await db.query(revenueQuery, params);
    
    // Claim status data
    const claimStatusQuery = `
      SELECT 
        c.status,
        COUNT(c.id) AS count
      FROM 
        medical_claims c
        JOIN medical_locations l ON c.location_id = l.id
      WHERE 
        c.claim_date BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        c.status;
    `;
    
    const claimStatusResult = await db.query(claimStatusQuery, params);
    
    // Daily revenue data
    const dailyRevenueQuery = `
      SELECT 
        pl.transaction_date::date AS day,
        SUM(pl.amount) AS revenue
      FROM 
        medical_production_log pl
        JOIN medical_locations l ON pl.location_id = l.id
      WHERE 
        pl.transaction_date BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        pl.transaction_date::date
      ORDER BY 
        day ASC;
    `;
    
    const dailyRevenueResult = await db.query(dailyRevenueQuery, params);
    
    return {
      revenue: {
        labels: revenueResult.rows.map(row => {
          const date = new Date(row.month);
          return date.toLocaleString('default', { month: 'short' });
        }),
        datasets: [
          {
            label: 'Revenue',
            data: revenueResult.rows.map(row => parseFloat(row.revenue)),
            backgroundColor: '#4caf50',
          },
          {
            label: 'Expenses',
            data: revenueResult.rows.map(row => parseFloat(row.expenses)),
            backgroundColor: '#f44336',
          }
        ]
      },
      claimStatus: {
        labels: claimStatusResult.rows.map(row => row.status),
        data: claimStatusResult.rows.map(row => parseInt(row.count)),
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      },
      dailyRevenue: {
        labels: dailyRevenueResult.rows.map(row => {
          const date = new Date(row.day);
          return date.toLocaleDateString('default', { day: 'numeric', month: 'short' });
        }),
        datasets: [{
          label: 'Daily Revenue',
          data: dailyRevenueResult.rows.map(row => parseFloat(row.revenue)),
          borderColor: '#2196f3',
          fill: false
        }]
      }
    };
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    throw new Error('Failed to retrieve financial report data');
  }
};

/**
 * Get patient demographics report data
 * @param {Object} params - Query parameters
 * @param {String} params.location - Location ID or 'all'
 * @returns {Object} Demographics report data
 */
exports.getDemographicsReports = async (params) => {
  const { location } = params;
  
  try {
    // Base query for all locations or filtered by location
    const locationFilter = location === 'all' ? '' : 'AND l.id = $1';
    const locationParams = location === 'all' ? [] : [sanitizeInput(location)];
    
    // Age distribution data
    const ageDistributionQuery = `
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) < 18 THEN '0-17'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) BETWEEN 18 AND 34 THEN '18-34'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) BETWEEN 35 AND 50 THEN '35-50'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) BETWEEN 51 AND 65 THEN '51-65'
          ELSE '66+'
        END AS age_group,
        COUNT(p.id) AS count
      FROM 
        medical_patients p
        JOIN medical_locations l ON p.preferred_location_id = l.id
      WHERE 
        1=1
        ${locationFilter}
      GROUP BY 
        age_group
      ORDER BY 
        age_group;
    `;
    
    const ageDistributionResult = await db.query(ageDistributionQuery, locationParams);
    
    // Gender distribution data
    const genderDistributionQuery = `
      SELECT 
        p.gender,
        COUNT(p.id) AS count
      FROM 
        medical_patients p
        JOIN medical_locations l ON p.preferred_location_id = l.id
      WHERE 
        1=1
        ${locationFilter}
      GROUP BY 
        p.gender
      ORDER BY 
        count DESC;
    `;
    
    const genderDistributionResult = await db.query(genderDistributionQuery, locationParams);
    
    // Insurance types data
    const insuranceTypesQuery = `
      SELECT 
        pi.insurance_provider,
        COUNT(pi.id) AS count
      FROM 
        medical_patient_insurance pi
        JOIN medical_patients p ON pi.patient_id = p.id
        JOIN medical_locations l ON p.preferred_location_id = l.id
      WHERE 
        1=1
        ${locationFilter}
      GROUP BY 
        pi.insurance_provider
      ORDER BY 
        count DESC
      LIMIT 5;
    `;
    
    const insuranceTypesResult = await db.query(insuranceTypesQuery, locationParams);
    
    return {
      ageDistribution: {
        labels: ageDistributionResult.rows.map(row => row.age_group),
        data: ageDistributionResult.rows.map(row => parseInt(row.count)),
        backgroundColor: ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3'],
      },
      genderDistribution: {
        labels: genderDistributionResult.rows.map(row => row.gender),
        data: genderDistributionResult.rows.map(row => parseInt(row.count)),
        backgroundColor: ['#e91e63', '#2196f3', '#9c27b0'],
      },
      insuranceTypes: {
        labels: insuranceTypesResult.rows.map(row => row.insurance_provider),
        data: insuranceTypesResult.rows.map(row => parseInt(row.count)),
        backgroundColor: ['#9c27b0', '#2196f3', '#4caf50', '#ff9800', '#795548'],
      }
    };
  } catch (error) {
    console.error('Error fetching demographics reports:', error);
    throw new Error('Failed to retrieve demographics report data');
  }
};

/**
 * Get appointment statistics report data
 * @param {Object} params - Query parameters
 * @param {Date} params.startDate - Start date for report
 * @param {Date} params.endDate - End date for report
 * @param {String} params.location - Location ID or 'all'
 * @returns {Object} Appointment report data
 */
exports.getAppointmentReports = async (params) => {
  const { startDate, endDate, location } = params;
  const { formattedStartDate, formattedEndDate } = formatDateRange(startDate, endDate);
  
  try {
    // Base query for all locations or filtered by location
    const locationFilter = location === 'all' ? '' : 'AND l.id = $3';
    
    // Appointment types data
    const appointmentTypesQuery = `
      SELECT 
        a.type,
        COUNT(a.id) AS count
      FROM 
        medical_appointments a
        JOIN medical_locations l ON a.location_id = l.id
      WHERE 
        a.appointment_date BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        a.type
      ORDER BY 
        count DESC;
    `;
    
    const params = location === 'all' 
      ? [formattedStartDate, formattedEndDate] 
      : [formattedStartDate, formattedEndDate, sanitizeInput(location)];
    
    const appointmentTypesResult = await db.query(appointmentTypesQuery, params);
    
    // Appointment status data
    const appointmentStatusQuery = `
      SELECT 
        a.status,
        COUNT(a.id) AS count
      FROM 
        medical_appointments a
        JOIN medical_locations l ON a.location_id = l.id
      WHERE 
        a.appointment_date BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        a.status
      ORDER BY 
        count DESC;
    `;
    
    const appointmentStatusResult = await db.query(appointmentStatusQuery, params);
    
    // Appointments over time data
    const appointmentsOverTimeQuery = `
      SELECT 
        date_trunc('month', a.appointment_date) AS month,
        COUNT(a.id) AS count
      FROM 
        medical_appointments a
        JOIN medical_locations l ON a.location_id = l.id
      WHERE 
        a.appointment_date BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        date_trunc('month', a.appointment_date)
      ORDER BY 
        month ASC;
    `;
    
    const appointmentsOverTimeResult = await db.query(appointmentsOverTimeQuery, params);
    
    return {
      appointmentTypes: {
        labels: appointmentTypesResult.rows.map(row => row.type),
        data: appointmentTypesResult.rows.map(row => parseInt(row.count)),
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336'],
      },
      appointmentStatus: {
        labels: appointmentStatusResult.rows.map(row => row.status),
        data: appointmentStatusResult.rows.map(row => parseInt(row.count)),
        backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#2196f3'],
      },
      appointmentsOverTime: {
        labels: appointmentsOverTimeResult.rows.map(row => {
          const date = new Date(row.month);
          return date.toLocaleString('default', { month: 'short', year: 'numeric' });
        }),
        datasets: [{
          label: 'Appointments',
          data: appointmentsOverTimeResult.rows.map(row => parseInt(row.count)),
          borderColor: '#9c27b0',
          fill: false
        }]
      }
    };
  } catch (error) {
    console.error('Error fetching appointment reports:', error);
    throw new Error('Failed to retrieve appointment report data');
  }
};

/**
 * Get claims analysis report data
 * @param {Object} params - Query parameters
 * @param {Date} params.startDate - Start date for report
 * @param {Date} params.endDate - End date for report
 * @param {String} params.location - Location ID or 'all'
 * @returns {Object} Claims report data
 */
exports.getClaimsReports = async (params) => {
  const { startDate, endDate, location } = params;
  const { formattedStartDate, formattedEndDate } = formatDateRange(startDate, endDate);
  
  try {
    // Base query for all locations or filtered by location
    const locationFilter = location === 'all' ? '' : 'AND l.id = $3';
    
    // Claims by provider data
    const claimsByProviderQuery = `
      SELECT 
        p.first_name || ' ' || p.last_name AS provider_name,
        COUNT(c.id) AS claims_count
      FROM 
        medical_claims c
        JOIN medical_providers p ON c.provider_id = p.id
        JOIN medical_locations l ON c.location_id = l.id
      WHERE 
        c.claim_date BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        p.id, p.first_name, p.last_name
      ORDER BY 
        claims_count DESC
      LIMIT 5;
    `;
    
    const params = location === 'all' 
      ? [formattedStartDate, formattedEndDate] 
      : [formattedStartDate, formattedEndDate, sanitizeInput(location)];
    
    const claimsByProviderResult = await db.query(claimsByProviderQuery, params);
    
    // Denial reasons data
    const denialReasonsQuery = `
      SELECT 
        c.denial_reason,
        COUNT(c.id) AS count
      FROM 
        medical_claims c
        JOIN medical_locations l ON c.location_id = l.id
      WHERE 
        c.status = 'denied'
        AND c.claim_date BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        c.denial_reason
      ORDER BY 
        count DESC
      LIMIT 5;
    `;
    
    const denialReasonsResult = await db.query(denialReasonsQuery, params);
    
    // Reimbursement rate data
    const reimbursementRateQuery = `
      SELECT 
        date_trunc('month', c.claim_date) AS month,
        ROUND(SUM(c.paid_amount) / NULLIF(SUM(c.billed_amount), 0) * 100, 2) AS reimbursement_rate
      FROM 
        medical_claims c
        JOIN medical_locations l ON c.location_id = l.id
      WHERE 
        c.status = 'paid'
        AND c.claim_date BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        date_trunc('month', c.claim_date)
      ORDER BY 
        month ASC;
    `;
    
    const reimbursementRateResult = await db.query(reimbursementRateQuery, params);
    
    return {
      claimsByProvider: {
        labels: claimsByProviderResult.rows.map(row => row.provider_name),
        datasets: [
          {
            label: 'Claims Submitted',
            data: claimsByProviderResult.rows.map(row => parseInt(row.claims_count)),
            backgroundColor: '#2196f3',
          }
        ]
      },
      denialReasons: {
        labels: denialReasonsResult.rows.map(row => row.denial_reason),
        data: denialReasonsResult.rows.map(row => parseInt(row.count)),
        backgroundColor: ['#f44336', '#ff9800', '#ffeb3b', '#9c27b0', '#795548'],
      },
      reimbursementRate: {
        labels: reimbursementRateResult.rows.map(row => {
          const date = new Date(row.month);
          return date.toLocaleString('default', { month: 'short', year: 'numeric' });
        }),
        datasets: [{
          label: 'Reimbursement Rate (%)',
          data: reimbursementRateResult.rows.map(row => parseFloat(row.reimbursement_rate)),
          borderColor: '#4caf50',
          fill: false
        }]
      }
    };
  } catch (error) {
    console.error('Error fetching claims reports:', error);
    throw new Error('Failed to retrieve claims report data');
  }
};

/**
 * Get clinical metrics report data
 * @param {Object} params - Query parameters
 * @param {Date} params.startDate - Start date for report
 * @param {Date} params.endDate - End date for report
 * @param {String} params.location - Location ID or 'all'
 * @returns {Object} Clinical metrics report data
 */
exports.getClinicalReports = async (params) => {
  const { startDate, endDate, location } = params;
  const { formattedStartDate, formattedEndDate } = formatDateRange(startDate, endDate);
  
  try {
    // Base query for all locations or filtered by location
    const locationFilter = location === 'all' ? '' : 'AND l.id = $3';
    
    // Common conditions data
    const commonConditionsQuery = `
      SELECT 
        mh.condition,
        COUNT(mh.history_id) AS count
      FROM 
        medical_history mh
        JOIN medical_charts mc ON mh.chart_id = mc.chart_id
        JOIN medical_patients p ON mc.patient_id = p.id
        JOIN medical_locations l ON p.preferred_location_id = l.id
      WHERE 
        mh.recorded_date BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        mh.condition
      ORDER BY 
        count DESC
      LIMIT 10;
    `;
    
    const params = location === 'all' 
      ? [formattedStartDate, formattedEndDate] 
      : [formattedStartDate, formattedEndDate, sanitizeInput(location)];
    
    const commonConditionsResult = await db.query(commonConditionsQuery, params);
    
    // Vital signs averages by age group
    const vitalSignsQuery = `
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) < 18 THEN '0-17'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) BETWEEN 18 AND 34 THEN '18-34'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) BETWEEN 35 AND 50 THEN '35-50'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) BETWEEN 51 AND 65 THEN '51-65'
          ELSE '66+'
        END AS age_group,
        ROUND(AVG(mv.heart_rate)) AS avg_heart_rate,
        ROUND(AVG(mv.blood_pressure_systolic)) AS avg_systolic,
        ROUND(AVG(mv.blood_pressure_diastolic)) AS avg_diastolic,
        ROUND(AVG(mv.bmi), 1) AS avg_bmi
      FROM 
        medical_vital_signs mv
        JOIN medical_charts mc ON mv.chart_id = mc.chart_id
        JOIN medical_patients p ON mc.patient_id = p.id
        JOIN medical_locations l ON p.preferred_location_id = l.id
      WHERE 
        mv.recorded_at BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        age_group
      ORDER BY 
        age_group;
    `;
    
    const vitalSignsResult = await db.query(vitalSignsQuery, params);
    
    // Abnormal lab results
    const abnormalLabsQuery = `
      SELECT 
        ml.test_name,
        COUNT(ml.result_id) AS abnormal_count
      FROM 
        medical_lab_results ml
        JOIN medical_charts mc ON ml.chart_id = mc.chart_id
        JOIN medical_patients p ON mc.patient_id = p.id
        JOIN medical_locations l ON p.preferred_location_id = l.id
      WHERE 
        ml.test_date BETWEEN $1 AND $2
        AND ml.abnormal = TRUE
        ${locationFilter}
      GROUP BY 
        ml.test_name
      ORDER BY 
        abnormal_count DESC
      LIMIT 5;
    `;
    
    const abnormalLabsResult = await db.query(abnormalLabsQuery, params);
    
    // Medication prescriptions
    const medicationsQuery = `
      SELECT 
        mm.name,
        COUNT(mpm.medication_id) AS prescription_count
      FROM 
        medical_patient_medications mpm
        JOIN medical_medications mm ON mpm.medication_id = mm.medication_id
        JOIN medical_charts mc ON mpm.chart_id = mc.chart_id
        JOIN medical_patients p ON mc.patient_id = p.id
        JOIN medical_locations l ON p.preferred_location_id = l.id
      WHERE 
        mpm.prescribed_date BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        mm.name
      ORDER BY 
        prescription_count DESC
      LIMIT 10;
    `;
    
    const medicationsResult = await db.query(medicationsQuery, params);
    
    return {
      commonConditions: {
        labels: commonConditionsResult.rows.map(row => row.condition),
        datasets: [
          {
            label: 'Patient Count',
            data: commonConditionsResult.rows.map(row => parseInt(row.count)),
            backgroundColor: '#4caf50'
          }
        ]
      },
      vitalSigns: {
        ageGroups: vitalSignsResult.rows.map(row => row.age_group),
        datasets: [
          {
            label: 'Avg Heart Rate',
            data: vitalSignsResult.rows.map(row => parseInt(row.avg_heart_rate)),
            backgroundColor: '#f44336'
          },
          {
            label: 'Avg Systolic BP',
            data: vitalSignsResult.rows.map(row => parseInt(row.avg_systolic)),
            backgroundColor: '#9c27b0'
          },
          {
            label: 'Avg Diastolic BP',
            data: vitalSignsResult.rows.map(row => parseInt(row.avg_diastolic)),
            backgroundColor: '#2196f3'
          },
          {
            label: 'Avg BMI',
            data: vitalSignsResult.rows.map(row => parseFloat(row.avg_bmi)),
            backgroundColor: '#ff9800'
          }
        ]
      },
      abnormalLabs: {
        labels: abnormalLabsResult.rows.map(row => row.test_name),
        data: abnormalLabsResult.rows.map(row => parseInt(row.abnormal_count)),
        backgroundColor: ['#f44336', '#ff9800', '#ffeb3b', '#9c27b0', '#795548']
      },
      medications: {
        labels: medicationsResult.rows.map(row => row.name),
        data: medicationsResult.rows.map(row => parseInt(row.prescription_count)),
        backgroundColor: '#3f51b5'
      }
    };
  } catch (error) {
    console.error('Error fetching clinical reports:', error);
    throw new Error('Failed to retrieve clinical report data');
  }
};

/**
 * Get operational statistics report data
 * @param {Object} params - Query parameters
 * @param {Date} params.startDate - Start date for report
 * @param {Date} params.endDate - End date for report
 * @param {String} params.location - Location ID or 'all'
 * @returns {Object} Operational statistics report data
 */
exports.getOperationalReports = async (params) => {
  const { startDate, endDate, location } = params;
  const { formattedStartDate, formattedEndDate } = formatDateRange(startDate, endDate);
  
  try {
    // Base query for all locations or filtered by location
    const locationFilter = location === 'all' ? '' : 'AND l.id = $3';
    
    // Provider productivity data
    const providerProductivityQuery = `
      SELECT 
        CONCAT(u.first_name, ' ', u.last_name) AS provider_name,
        COUNT(a.id) AS appointment_count,
        SUM(EXTRACT(EPOCH FROM (a.end_time - a.start_time))/3600) AS total_hours,
        ROUND(COUNT(a.id) / SUM(EXTRACT(EPOCH FROM (a.end_time - a.start_time))/3600), 2) AS appointments_per_hour
      FROM 
        medical_appointments a
        JOIN medical_providers p ON a.provider_id = p.id
        JOIN medical_users u ON p.user_id = u.id
        JOIN medical_locations l ON a.location_id = l.id
      WHERE 
        a.appointment_date BETWEEN $1 AND $2
        AND a.status = 'completed'
        ${locationFilter}
      GROUP BY 
        provider_name
      ORDER BY 
        appointments_per_hour DESC;
    `;
    
    const params = location === 'all' 
      ? [formattedStartDate, formattedEndDate] 
      : [formattedStartDate, formattedEndDate, sanitizeInput(location)];
    
    const providerProductivityResult = await db.query(providerProductivityQuery, params);
    
    // Operatory utilization data
    const operatoryUtilizationQuery = `
      SELECT 
        o.name AS operatory_name,
        COUNT(a.id) AS appointment_count,
        SUM(EXTRACT(EPOCH FROM (a.end_time - a.start_time))/3600) AS utilized_hours,
        ROUND((SUM(EXTRACT(EPOCH FROM (a.end_time - a.start_time))/3600) / 
              (EXTRACT(DAYS FROM ($2::timestamp - $1::timestamp)) * 8)) * 100, 2) AS utilization_percentage
      FROM 
        medical_appointments a
        JOIN medical_operatories o ON a.operatory_id = o.id
        JOIN medical_locations l ON a.location_id = l.id
      WHERE 
        a.appointment_date BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        o.id, o.name
      ORDER BY 
        utilization_percentage DESC;
    `;
    
    const operatoryUtilizationResult = await db.query(operatoryUtilizationQuery, params);
    
    // No-show rate data
    const noShowRateQuery = `
      SELECT 
        date_trunc('month', a.appointment_date) AS month,
        COUNT(a.id) AS total_appointments,
        COUNT(CASE WHEN a.status = 'no-show' THEN 1 END) AS no_show_appointments,
        ROUND((COUNT(CASE WHEN a.status = 'no-show' THEN 1 END)::numeric / COUNT(a.id)::numeric) * 100, 2) AS no_show_percentage
      FROM 
        medical_appointments a
        JOIN medical_locations l ON a.location_id = l.id
      WHERE 
        a.appointment_date BETWEEN $1 AND $2
        ${locationFilter}
      GROUP BY 
        month
      ORDER BY 
        month ASC;
    `;
    
    const noShowRateResult = await db.query(noShowRateQuery, params);
    
    // Wait time data
    const waitTimeQuery = `
      SELECT 
        CONCAT(u.first_name, ' ', u.last_name) AS provider_name,
        ROUND(AVG(EXTRACT(EPOCH FROM (a.actual_start_time - a.start_time))/60), 2) AS avg_wait_time_mins
      FROM 
        medical_appointments a
        JOIN medical_providers p ON a.provider_id = p.id
        JOIN medical_users u ON p.user_id = u.id
        JOIN medical_locations l ON a.location_id = l.id
      WHERE 
        a.appointment_date BETWEEN $1 AND $2
        AND a.status = 'completed'
        AND a.actual_start_time IS NOT NULL
        ${locationFilter}
      GROUP BY 
        provider_name
      ORDER BY 
        avg_wait_time_mins ASC;
    `;
    
    const waitTimeResult = await db.query(waitTimeQuery, params);
    
    return {
      providerProductivity: {
        labels: providerProductivityResult.rows.map(row => row.provider_name),
        datasets: [
          {
            label: 'Appointments Per Hour',
            data: providerProductivityResult.rows.map(row => parseFloat(row.appointments_per_hour)),
            backgroundColor: '#4caf50'
          }
        ]
      },
      operatoryUtilization: {
        labels: operatoryUtilizationResult.rows.map(row => row.operatory_name),
        datasets: [
          {
            label: 'Utilization Percentage',
            data: operatoryUtilizationResult.rows.map(row => parseFloat(row.utilization_percentage)),
            backgroundColor: '#2196f3'
          }
        ]
      },
      noShowRate: {
        labels: noShowRateResult.rows.map(row => {
          const date = new Date(row.month);
          return date.toLocaleString('default', { month: 'short', year: 'numeric' });
        }),
        datasets: [{
          label: 'No-Show Rate (%)',
          data: noShowRateResult.rows.map(row => parseFloat(row.no_show_percentage)),
          borderColor: '#f44336',
          fill: false
        }]
      },
      waitTimes: {
        labels: waitTimeResult.rows.map(row => row.provider_name),
        datasets: [{
          label: 'Average Wait Time (minutes)',
          data: waitTimeResult.rows.map(row => parseFloat(row.avg_wait_time_mins)),
          backgroundColor: '#ff9800'
        }]
      }
    };
  } catch (error) {
    console.error('Error fetching operational reports:', error);
    throw new Error('Failed to retrieve operational report data');
  }
};

/**
 * Get comprehensive report data based on report type
 * @param {Object} params - Query parameters
 * @param {String} params.reportType - Type of report to generate
 * @param {Date} params.startDate - Start date for report
 * @param {Date} params.endDate - End date for report
 * @param {String} params.location - Location ID or 'all'
 * @returns {Object} Report data for the specified type
 */
exports.getReportData = async (params) => {
  const { reportType, startDate, endDate, location } = params;
  
  try {
    switch (reportType) {
      case 'financial':
        return await exports.getFinancialReports({ startDate, endDate, location });
      case 'demographics':
        return await exports.getDemographicsReports({ location });
      case 'appointments':
        return await exports.getAppointmentReports({ startDate, endDate, location });
      case 'claims':
        return await exports.getClaimsReports({ startDate, endDate, location });
      case 'clinical':
        return await exports.getClinicalReports({ startDate, endDate, location });
      case 'operational':
        return await exports.getOperationalReports({ startDate, endDate, location });
      default:
        throw new Error('Invalid report type specified');
    }
  } catch (error) {
    console.error(`Error generating ${reportType} report:`, error);
    throw new Error(`Failed to generate ${reportType} report`);
  }
};

/**
 * Get custom report data based on user-defined parameters
 * @param {Object} params - Query parameters
 * @param {Date} params.startDate - Start date for report
 * @param {Date} params.endDate - End date for report
 * @param {String} params.location - Location ID or 'all'
 * @param {String} params.dataSource - Main data source for the report ('appointments', 'patients', 'claims', 'payments')
 * @param {Array} params.dimensions - Dimensions to group by (e.g., ['provider', 'month'])
 * @param {Array} params.metrics - Metrics to calculate (e.g., ['count', 'revenue'])
 * @param {Object} params.filters - Additional filters for the data
 * @returns {Object} Custom report data
 */
exports.getCustomReports = async (params) => {
  const { startDate, endDate, location, dataSource, dimensions, metrics, filters } = params;
  const { formattedStartDate, formattedEndDate } = formatDateRange(startDate, endDate);
  
  try {
    // Base filter for location
    const locationFilter = location === 'all' ? '' : 'AND l.id = $3';
    
    // Build query based on data source
    let baseQuery = '';
    let baseParams = location === 'all' 
      ? [formattedStartDate, formattedEndDate] 
      : [formattedStartDate, formattedEndDate, sanitizeInput(location)];
    
    // Define select clause, from clause, where clause based on data source
    let selectClause = '';
    let fromClause = '';
    let whereClause = '';
    let groupByClause = '';
    let orderByClause = '';
    
    switch (dataSource) {
      case 'appointments':
        fromClause = `
          FROM 
            medical_appointments a
            JOIN medical_locations l ON a.location_id = l.id
            JOIN medical_patients p ON a.patient_id = p.id
            JOIN medical_providers pr ON a.provider_id = pr.id
            JOIN medical_operatories o ON a.operatory_id = o.id
        `;
        whereClause = `
          WHERE 
            a.appointment_date BETWEEN $1 AND $2
            ${locationFilter}
        `;
        break;
        
      case 'patients':
        fromClause = `
          FROM 
            medical_patients p
            JOIN medical_locations l ON p.preferred_location_id = l.id
            LEFT JOIN medical_patient_insurance pi ON p.id = pi.patient_id
        `;
        whereClause = `
          WHERE 
            p.created_at BETWEEN $1 AND $2
            ${locationFilter}
        `;
        break;
        
      case 'claims':
        fromClause = `
          FROM 
            medical_claims c
            JOIN medical_locations l ON c.location_id = l.id
            JOIN medical_patients p ON c.patient_id = p.id
            JOIN medical_providers pr ON c.provider_id = pr.id
        `;
        whereClause = `
          WHERE 
            c.claim_date BETWEEN $1 AND $2
            ${locationFilter}
        `;
        break;
        
      case 'payments':
        fromClause = `
          FROM 
            medical_payments py
            JOIN medical_patients p ON py.patient_id = p.id
            JOIN medical_claims c ON py.claim_id = c.id
            JOIN medical_locations l ON c.location_id = l.id
        `;
        whereClause = `
          WHERE 
            py.payment_date BETWEEN $1 AND $2
            ${locationFilter}
        `;
        break;
        
      default:
        throw new Error('Invalid data source specified');
    }
    
    // Build select and group by clauses based on dimensions
    const dimensionClauses = [];
    const groupByClauses = [];
    
    if (dimensions && dimensions.length > 0) {
      dimensions.forEach(dimension => {
        switch (dimension) {
          case 'provider':
            if (['appointments', 'claims'].includes(dataSource)) {
              dimensionClauses.push("CONCAT(pr.first_name, ' ', pr.last_name) AS provider_name");
              groupByClauses.push("provider_name");
            }
            break;
          case 'patient':
            dimensionClauses.push("CONCAT(p.first_name, ' ', p.last_name) AS patient_name");
            groupByClauses.push("patient_name");
            break;
          case 'month':
            const dateField = dataSource === 'appointments' ? 'a.appointment_date' :
                             dataSource === 'claims' ? 'c.claim_date' :
                             dataSource === 'payments' ? 'py.payment_date' : 'p.created_at';
            dimensionClauses.push(`date_trunc('month', ${dateField}) AS month`);
            groupByClauses.push("month");
            break;
          case 'status':
            if (['appointments', 'claims'].includes(dataSource)) {
              const statusField = dataSource === 'appointments' ? 'a.status' : 'c.status';
              dimensionClauses.push(`${statusField} AS status`);
              groupByClauses.push("status");
            }
            break;
          case 'insurance':
            if (dataSource === 'patients') {
              dimensionClauses.push("pi.insurance_provider AS insurance");
              groupByClauses.push("insurance");
            }
            break;
          case 'appointmentType':
            if (dataSource === 'appointments') {
              dimensionClauses.push("a.type AS appointment_type");
              groupByClauses.push("appointment_type");
            }
            break;
        }
      });
    }
    
    // Add metrics to select clause
    const metricClauses = [];
    
    if (metrics && metrics.length > 0) {
      metrics.forEach(metric => {
        switch (metric) {
          case 'count':
            metricClauses.push(`COUNT(*) AS record_count`);
            break;
          case 'revenue':
            if (['claims', 'payments'].includes(dataSource)) {
              const amountField = dataSource === 'claims' ? 'c.total_amount' : 'py.payment_amount';
              metricClauses.push(`SUM(${amountField}) AS total_revenue`);
            }
            break;
          case 'avgDuration':
            if (dataSource === 'appointments') {
              metricClauses.push(`ROUND(AVG(EXTRACT(EPOCH FROM (a.end_time - a.start_time))/60), 2) AS avg_duration_minutes`);
            }
            break;
          case 'noShowRate':
            if (dataSource === 'appointments') {
              metricClauses.push(`
                ROUND((COUNT(CASE WHEN a.status = 'no-show' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2) AS no_show_rate
              `);
            }
            break;
          case 'claimApprovalRate':
            if (dataSource === 'claims') {
              metricClauses.push(`
                ROUND((COUNT(CASE WHEN c.status = 'paid' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2) AS approval_rate
              `);
            }
            break;
        }
      });
    }
    
    // Combine all clauses into main query
    selectClause = `SELECT ${dimensionClauses.join(', ')}, ${metricClauses.join(', ')}`;
    
    if (groupByClauses.length > 0) {
      groupByClause = `GROUP BY ${groupByClauses.join(', ')}`;
    }
    
    if (groupByClauses.length > 0) {
      orderByClause = `ORDER BY ${groupByClauses[0]}`;
    } else {
      orderByClause = `ORDER BY 1`;
    }
    
    // Apply additional filters
    if (filters && Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        switch (key) {
          case 'providerIds':
            if (['appointments', 'claims'].includes(dataSource) && value && value.length > 0) {
              const providerField = dataSource === 'appointments' ? 'a.provider_id' : 'c.provider_id';
              whereClause += ` AND ${providerField} IN (${value.join(',')})`;
            }
            break;
          case 'statuses':
            if (['appointments', 'claims'].includes(dataSource) && value && value.length > 0) {
              const statusField = dataSource === 'appointments' ? 'a.status' : 'c.status';
              whereClause += ` AND ${statusField} IN ('${value.join("','")}')`;
            }
            break;
          case 'appointmentTypes':
            if (dataSource === 'appointments' && value && value.length > 0) {
              whereClause += ` AND a.type IN ('${value.join("','")}')`;
            }
            break;
        }
      });
    }
    
    // Build the final query
    const query = `
      ${selectClause}
      ${fromClause}
      ${whereClause}
      ${groupByClause}
      ${orderByClause}
    `;
    
    const result = await db.query(query, baseParams);
    
    // Format the results for charting
    const labels = [];
    const datasets = [];
    const metricKeys = [];
    
    // Extract metric keys from the first row
    if (result.rows.length > 0) {
      Object.keys(result.rows[0]).forEach(key => {
        if (!dimensions.some(dim => 
          key === 'provider_name' || 
          key === 'patient_name' || 
          key === 'month' || 
          key === 'status' || 
          key === 'insurance' || 
          key === 'appointment_type'
        )) {
          metricKeys.push(key);
        }
      });
    }
    
    // Populate labels and datasets
    if (dimensions.length > 0) {
      const primaryDimension = dimensions[0];
      let dimensionKey = '';
      
      switch (primaryDimension) {
        case 'provider':
          dimensionKey = 'provider_name';
          break;
        case 'patient':
          dimensionKey = 'patient_name';
          break;
        case 'month':
          dimensionKey = 'month';
          break;
        case 'status':
          dimensionKey = 'status';
          break;
        case 'insurance':
          dimensionKey = 'insurance';
          break;
        case 'appointmentType':
          dimensionKey = 'appointment_type';
          break;
      }
      
      // Format labels based on dimension type
      result.rows.forEach(row => {
        if (dimensionKey === 'month' && row[dimensionKey]) {
          const date = new Date(row[dimensionKey]);
          labels.push(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
        } else {
          labels.push(row[dimensionKey] || 'Unknown');
        }
      });
      
      // Create datasets for each metric
      metricKeys.forEach(metricKey => {
        datasets.push({
          label: metricKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          data: result.rows.map(row => parseFloat(row[metricKey]) || 0),
          backgroundColor: datasets.length % 2 === 0 ? '#4caf50' : '#2196f3',
        });
      });
    }
    
    return {
      rawData: result.rows,
      chartData: {
        labels,
        datasets
      }
    };
  } catch (error) {
    console.error('Error fetching custom reports:', error);
    throw new Error('Failed to retrieve custom report data: ' + error.message);
  }
};
