import pg from 'pg';
import dotenv from 'dotenv';


dotenv.config();

// PostgreSQL connection pool
const pool = new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'your_postgres_username',
  password: process.env.PGPASSWORD || 'your_postgres_password',
  database: process.env.PGDATABASE || 'timewise_procument',
  port: parseInt(process.env.PGPORT || '5432'),
});

// Supplier management model with database operations
const supplierManagementModel = {
  /**
   * Get all suppliers with optional filtering
   * @param {string} status - Filter by supplier status (optional)
   * @param {string} country - Filter by country (optional)
   * @param {number} limit - Limit the number of results (optional)
   * @returns {Promise<Array>} Array of supplier objects
   */
  getAllSuppliers: async (status, country, limit = 100) => {
    try {
      let query = `
        SELECT * FROM suppliers
        WHERE 1=1
      `;
      
      const params = [];
      
      if (status) {
        query += ` AND supplier_status = $${params.length + 1}`;
        params.push(status);
      }
      
      if (country) {
        query += ` AND country = $${params.length + 1}`;
        params.push(country);
      }
      
      query += ` ORDER BY supplier_name LIMIT $${params.length + 1}`;
      params.push(limit);
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error in getAllSuppliers:', error);
      return [];
    }
  },

  /**
   * Get a supplier by ID
   * @param {number} supplierId - Supplier ID
   * @returns {Promise<Object|null>} Supplier object or null if not found
   */
  getSupplierById: async (supplierId) => {
    try {
      const query = 'SELECT * FROM suppliers WHERE supplier_id = $1';
      const result = await pool.query(query, [supplierId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in getSupplierById:', error);
      return null;
    }
  },

  /**
   * Create a new supplier
   * @param {Object} supplierData - Supplier data
   * @returns {Promise<Object|null>} Created supplier object or null if failed
   */
  createSupplier: async (supplierData) => {
    try {
      const {
        supplier_name,
        tax_id,
        supplier_status,
        onboarding_date,
        financial_stability_score,
        payment_terms,
        contact_name,
        contact_email,
        contact_phone,
        address_line1,
        city,
        state,
        postal_code,
        country
      } = supplierData;
      
      const query = `
        INSERT INTO suppliers (
          supplier_name,
          tax_id,
          supplier_status,
          onboarding_date,
          financial_stability_score,
          payment_terms,
          contact_name,
          contact_email,
          contact_phone,
          address_line1,
          city,
          state,
          postal_code,
          country
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;
      
      const params = [
        supplier_name,
        tax_id,
        supplier_status || 'pending',
        onboarding_date,
        financial_stability_score,
        payment_terms,
        contact_name,
        contact_email,
        contact_phone,
        address_line1,
        city,
        state,
        postal_code,
        country
      ];
      
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error in createSupplier:', error);
      return null;
    }
  },

  /**
   * Update a supplier
   * @param {number} supplierId - Supplier ID
   * @param {Object} supplierData - Supplier data to update
   * @returns {Promise<Object|null>} Updated supplier object or null if failed
   */
  updateSupplier: async (supplierId, supplierData) => {
    try {
      // Get the current supplier data
      const currentSupplier = await supplierManagementModel.getSupplierById(supplierId);
      
      if (!currentSupplier) {
        return null;
      }
      
      // Merge current data with updates
      const updatedData = {
        ...currentSupplier,
        ...supplierData,
        updated_at: new Date()
      };
      
      const query = `
        UPDATE suppliers
        SET
          supplier_name = $1,
          tax_id = $2,
          supplier_status = $3,
          onboarding_date = $4,
          financial_stability_score = $5,
          payment_terms = $6,
          contact_name = $7,
          contact_email = $8,
          contact_phone = $9,
          address_line1 = $10,
          city = $11,
          state = $12,
          postal_code = $13,
          country = $14,
          updated_at = $15
        WHERE supplier_id = $16
        RETURNING *
      `;
      
      const params = [
        updatedData.supplier_name,
        updatedData.tax_id,
        updatedData.supplier_status,
        updatedData.onboarding_date,
        updatedData.financial_stability_score,
        updatedData.payment_terms,
        updatedData.contact_name,
        updatedData.contact_email,
        updatedData.contact_phone,
        updatedData.address_line1,
        updatedData.city,
        updatedData.state,
        updatedData.postal_code,
        updatedData.country,
        updatedData.updated_at,
        supplierId
      ];
      
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error in updateSupplier:', error);
      return null;
    }
  },

  /**
   * Delete a supplier
   * @param {number} supplierId - Supplier ID
   * @returns {Promise<boolean>} True if deleted, false if failed
   */
  deleteSupplier: async (supplierId) => {
    try {
      const query = 'DELETE FROM suppliers WHERE supplier_id = $1 RETURNING supplier_id';
      const result = await pool.query(query, [supplierId]);
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error in deleteSupplier:', error);
      return false;
    }
  },

  /**
   * Get supplier certifications
   * @param {number} supplierId - Supplier ID
   * @returns {Promise<Array>} Array of certification objects
   */
  getSupplierCertifications: async (supplierId) => {
    try {
      const query = `
        SELECT * FROM supplier_certifications
        WHERE supplier_id = $1
        ORDER BY expiry_date ASC
      `;
      
      const result = await pool.query(query, [supplierId]);
      return result.rows;
    } catch (error) {
      console.error('Error in getSupplierCertifications:', error);
      return [];
    }
  },

  /**
   * Add a certification to a supplier
   * @param {Object} certificationData - Certification data
   * @returns {Promise<Object|null>} Created certification object or null if failed
   */
  addSupplierCertification: async (certificationData) => {
    try {
      const {
        supplier_id,
        certification_name,
        certification_number,
        issuing_authority,
        issue_date,
        expiry_date,
        status,
        document_url
      } = certificationData;
      
      const query = `
        INSERT INTO supplier_certifications (
          supplier_id,
          certification_name,
          certification_number,
          issuing_authority,
          issue_date,
          expiry_date,
          status,
          document_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const params = [
        supplier_id,
        certification_name,
        certification_number,
        issuing_authority,
        issue_date,
        expiry_date,
        status || 'active',
        document_url
      ];
      
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error in addSupplierCertification:', error);
      return null;
    }
  },

  /**
   * Get supplier performance evaluations
   * @param {number} supplierId - Supplier ID
   * @returns {Promise<Array>} Array of evaluation objects
   */
  getSupplierPerformanceEvaluations: async (supplierId) => {
    try {
      const query = `
        SELECT * FROM supplier_performance_evaluations
        WHERE supplier_id = $1
        ORDER BY evaluation_date DESC
      `;
      
      const result = await pool.query(query, [supplierId]);
      return result.rows;
    } catch (error) {
      console.error('Error in getSupplierPerformanceEvaluations:', error);
      return [];
    }
  },

  /**
   * Add a performance evaluation for a supplier
   * @param {Object} evaluationData - Evaluation data
   * @returns {Promise<Object|null>} Created evaluation object or null if failed
   */
  addSupplierPerformanceEvaluation: async (evaluationData) => {
    try {
      const {
        supplier_id,
        evaluation_date,
        quality_score,
        delivery_score,
        responsiveness_score,
        cost_score,
        reviewer_id,
        comments
      } = evaluationData;
      
      // Calculate overall score as average of the four scores
      const overall_score = (
        (parseFloat(quality_score) + 
         parseFloat(delivery_score) + 
         parseFloat(responsiveness_score) + 
         parseFloat(cost_score)) / 4
      ).toFixed(1);
      
      const query = `
        INSERT INTO supplier_performance_evaluations (
          supplier_id,
          evaluation_date,
          quality_score,
          delivery_score,
          responsiveness_score,
          cost_score,
          overall_score,
          reviewer_id,
          comments
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const params = [
        supplier_id,
        evaluation_date,
        quality_score,
        delivery_score,
        responsiveness_score,
        cost_score,
        overall_score,
        reviewer_id,
        comments
      ];
      
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error in addSupplierPerformanceEvaluation:', error);
      return null;
    }
  },

  /**
   * Get supplier risk assessments
   * @param {number} supplierId - Supplier ID
   * @returns {Promise<Array>} Array of risk assessment objects
   */
  getSupplierRiskAssessments: async (supplierId) => {
    try {
      const query = `
        SELECT * FROM supplier_risk_assessments
        WHERE supplier_id = $1
        ORDER BY assessment_date DESC
      `;
      
      const result = await pool.query(query, [supplierId]);
      return result.rows;
    } catch (error) {
      console.error('Error in getSupplierRiskAssessments:', error);
      return [];
    }
  },

  /**
   * Add a risk assessment for a supplier
   * @param {Object} assessmentData - Risk assessment data
   * @returns {Promise<Object|null>} Created risk assessment object or null if failed
   */
  addSupplierRiskAssessment: async (assessmentData) => {
    try {
      const {
        supplier_id,
        assessment_date,
        financial_risk_score,
        compliance_risk_score,
        supply_chain_risk_score,
        geopolitical_risk_score,
        assessor_id,
        mitigation_plan,
        next_assessment_date
      } = assessmentData;
      
      // Calculate overall risk score as average of the four scores
      const overall_risk_score = (
        (parseFloat(financial_risk_score) + 
         parseFloat(compliance_risk_score) + 
         parseFloat(supply_chain_risk_score) + 
         parseFloat(geopolitical_risk_score)) / 4
      ).toFixed(1);
      
      // Determine risk level based on overall score
      let risk_level;
      if (overall_risk_score <= 1.5) {
        risk_level = 'low';
      } else if (overall_risk_score <= 2.5) {
        risk_level = 'medium';
      } else if (overall_risk_score <= 3.5) {
        risk_level = 'high';
      } else {
        risk_level = 'critical';
      }
      
      const query = `
        INSERT INTO supplier_risk_assessments (
          supplier_id,
          assessment_date,
          financial_risk_score,
          compliance_risk_score,
          supply_chain_risk_score,
          geopolitical_risk_score,
          overall_risk_score,
          risk_level,
          assessor_id,
          mitigation_plan,
          next_assessment_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const params = [
        supplier_id,
        assessment_date,
        financial_risk_score,
        compliance_risk_score,
        supply_chain_risk_score,
        geopolitical_risk_score,
        overall_risk_score,
        risk_level,
        assessor_id,
        mitigation_plan,
        next_assessment_date
      ];
      
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error in addSupplierRiskAssessment:', error);
      return null;
    }
  },

  /**
   * Get supplier contracts
   * @param {number} supplierId - Supplier ID
   * @returns {Promise<Array>} Array of contract objects
   */
  getSupplierContracts: async (supplierId) => {
    try {
      const query = `
        SELECT * FROM supplier_contracts
        WHERE supplier_id = $1
        ORDER BY end_date ASC
      `;
      
      const result = await pool.query(query, [supplierId]);
      return result.rows;
    } catch (error) {
      console.error('Error in getSupplierContracts:', error);
      return [];
    }
  },

  /**
   * Add a contract for a supplier
   * @param {Object} contractData - Contract data
   * @returns {Promise<Object|null>} Created contract object or null if failed
   */
  addSupplierContract: async (contractData) => {
    try {
      const {
        supplier_id,
        contract_number,
        contract_type,
        start_date,
        end_date,
        total_value,
        currency,
        payment_terms,
        status,
        auto_renewal,
        renewal_notice_days,
        document_url
      } = contractData;
      
      const query = `
        INSERT INTO supplier_contracts (
          supplier_id,
          contract_number,
          contract_type,
          start_date,
          end_date,
          total_value,
          currency,
          payment_terms,
          status,
          auto_renewal,
          renewal_notice_days,
          document_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;
      
      const params = [
        supplier_id,
        contract_number,
        contract_type,
        start_date,
        end_date,
        total_value,
        currency || 'USD',
        payment_terms,
        status || 'active',
        auto_renewal || false,
        renewal_notice_days,
        document_url
      ];
      
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error in addSupplierContract:', error);
      return null;
    }
  },

  /**
   * Get contract milestones
   * @param {number} contractId - Contract ID
   * @returns {Promise<Array>} Array of milestone objects
   */
  getContractMilestones: async (contractId) => {
    try {
      const query = `
        SELECT * FROM supplier_contracts_milestones
        WHERE contract_id = $1
        ORDER BY due_date ASC
      `;
      
      const result = await pool.query(query, [contractId]);
      return result.rows;
    } catch (error) {
      console.error('Error in getContractMilestones:', error);
      return [];
    }
  },

  /**
   * Add a milestone to a contract
   * @param {Object} milestoneData - Milestone data
   * @returns {Promise<Object|null>} Created milestone object or null if failed
   */
  addContractMilestone: async (milestoneData) => {
    try {
      const {
        contract_id,
        milestone_name,
        due_date,
        completion_date,
        status,
        description,
        payment_amount,
        payment_status
      } = milestoneData;
      
      const query = `
        INSERT INTO supplier_contracts_milestones (
          contract_id,
          milestone_name,
          due_date,
          completion_date,
          status,
          description,
          payment_amount,
          payment_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const params = [
        contract_id,
        milestone_name,
        due_date,
        completion_date,
        status || 'pending',
        description,
        payment_amount,
        payment_status || 'unpaid'
      ];
      
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error in addContractMilestone:', error);
      return null;
    }
  },

  /**
   * Get supplier documents
   * @param {number} supplierId - Supplier ID
   * @returns {Promise<Array>} Array of document objects
   */
  getSupplierDocuments: async (supplierId) => {
    try {
      const query = `
        SELECT * FROM supplier_documents
        WHERE supplier_id = $1
        ORDER BY upload_date DESC
      `;
      
      const result = await pool.query(query, [supplierId]);
      return result.rows;
    } catch (error) {
      console.error('Error in getSupplierDocuments:', error);
      return [];
    }
  },

  /**
   * Add a document for a supplier
   * @param {Object} documentData - Document data
   * @returns {Promise<Object|null>} Created document object or null if failed
   */
  addSupplierDocument: async (documentData) => {
    try {
      const {
        supplier_id,
        document_type,
        document_name,
        file_path,
        expiry_date,
        status,
        uploaded_by,
        version
      } = documentData;
      
      const query = `
        INSERT INTO supplier_documents (
          supplier_id,
          document_type,
          document_name,
          file_path,
          expiry_date,
          status,
          uploaded_by,
          version
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const params = [
        supplier_id,
        document_type,
        document_name,
        file_path,
        expiry_date,
        status || 'active',
        uploaded_by,
        version
      ];
      
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error in addSupplierDocument:', error);
      return null;
    }
  },

  /**
   * Get suppliers with expiring contracts
   * @param {number} daysThreshold - Number of days to look ahead
   * @returns {Promise<Array>} Array of supplier objects with expiring contracts
   */
  getSuppliersWithExpiringContracts: async (daysThreshold = 90) => {
    try {
      const query = `
        SELECT s.*, c.contract_id, c.contract_number, c.end_date
        FROM suppliers s
        JOIN supplier_contracts c ON s.supplier_id = c.supplier_id
        WHERE c.status = 'active'
        AND c.end_date <= CURRENT_DATE + INTERVAL '${daysThreshold} days'
        ORDER BY c.end_date ASC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in getSuppliersWithExpiringContracts:', error);
      return [];
    }
  },

  /**
   * Get suppliers with expiring certifications
   * @param {number} daysThreshold - Number of days to look ahead
   * @returns {Promise<Array>} Array of supplier objects with expiring certifications
   */
  getSuppliersWithExpiringCertifications: async (daysThreshold = 90) => {
    try {
      const query = `
        SELECT s.*, c.certification_id, c.certification_name, c.expiry_date
        FROM suppliers s
        JOIN supplier_certifications c ON s.supplier_id = c.supplier_id
        WHERE c.status = 'active'
        AND c.expiry_date <= CURRENT_DATE + INTERVAL '${daysThreshold} days'
        ORDER BY c.expiry_date ASC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in getSuppliersWithExpiringCertifications:', error);
      return [];
    }
  },

  /**
   * Get suppliers with upcoming risk assessments
   * @param {number} daysThreshold - Number of days to look ahead
   * @returns {Promise<Array>} Array of supplier objects with upcoming risk assessments
   */
  getSuppliersWithUpcomingRiskAssessments: async (daysThreshold = 30) => {
    try {
      const query = `
        SELECT s.*, r.assessment_id, r.next_assessment_date
        FROM suppliers s
        JOIN supplier_risk_assessments r ON s.supplier_id = r.supplier_id
        WHERE r.next_assessment_date <= CURRENT_DATE + INTERVAL '${daysThreshold} days'
        ORDER BY r.next_assessment_date ASC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in getSuppliersWithUpcomingRiskAssessments:', error);
      return [];
    }
  },

  /**
   * Get suppliers with high risk
   * @returns {Promise<Array>} Array of supplier objects with high risk
   */
  getHighRiskSuppliers: async () => {
    try {
      const query = `
        SELECT s.*, r.assessment_id, r.overall_risk_score, r.risk_level
        FROM suppliers s
        JOIN supplier_risk_assessments r ON s.supplier_id = r.supplier_id
        WHERE r.risk_level IN ('high', 'critical')
        ORDER BY r.overall_risk_score DESC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in getHighRiskSuppliers:', error);
      return [];
    }
  },

  /**
   * Get top performing suppliers
   * @param {number} limit - Number of suppliers to return
   * @returns {Promise<Array>} Array of top performing supplier objects
   */
  getTopPerformingSuppliers: async (limit = 10) => {
    try {
      const query = `
        SELECT s.*, 
               AVG(p.overall_score) as avg_overall_score,
               AVG(p.quality_score) as avg_quality_score,
               AVG(p.delivery_score) as avg_delivery_score,
               AVG(p.responsiveness_score) as avg_responsiveness_score,
               AVG(p.cost_score) as avg_cost_score
        FROM suppliers s
        JOIN supplier_performance_evaluations p ON s.supplier_id = p.supplier_id
        WHERE s.supplier_status = 'active'
        GROUP BY s.supplier_id
        ORDER BY avg_overall_score DESC
        LIMIT $1
      `;
      
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error in getTopPerformingSuppliers:', error);
      return [];
    }
  },

  /**
   * Get supplier performance summary
   * @returns {Promise<Array>} Array of supplier performance summary objects
   */
  getSupplierPerformanceSummary: async () => {
    try {
      const query = `
        SELECT 
          s.supplier_id,
          s.supplier_name,
          sp.quality_score as avg_quality_score,
          sp.delivery_score as avg_delivery_score,
          sp.responsiveness_score as avg_responsiveness_score,
          sp.cost_score as avg_cost_score,
          sp.overall_score as avg_overall_score,
          sp.performance_category
        FROM suppliers s
        JOIN supplier_performance sp ON s.supplier_id = sp.supplier_id
        WHERE s.supplier_status = 'active'
        ORDER BY sp.overall_score DESC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in getSupplierPerformanceSummary:', error);
      return [];
    }
  },

  /**
   * Get supplier onboarding statistics
   * @param {number} months - Number of months to look back
   * @returns {Promise<Object>} Supplier onboarding statistics
   */
  getSupplierOnboardingStats: async (months = 12) => {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_onboarded,
          COUNT(CASE WHEN supplier_status = 'active' THEN 1 END) as active_suppliers,
          COUNT(CASE WHEN supplier_status = 'pending' THEN 1 END) as pending_suppliers,
          COUNT(CASE WHEN supplier_status = 'inactive' THEN 1 END) as inactive_suppliers,
          COUNT(CASE WHEN supplier_status = 'suspended' THEN 1 END) as suspended_suppliers,
          AVG(financial_stability_score) as avg_financial_score
        FROM suppliers
        WHERE onboarding_date >= CURRENT_DATE - INTERVAL '${months} months'
      `;
      
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error in getSupplierOnboardingStats:', error);
      return {
        total_onboarded: 0,
        active_suppliers: 0,
        pending_suppliers: 0,
        inactive_suppliers: 0,
        suspended_suppliers: 0,
        avg_financial_score: 0
      };
    }
  },

  /**
   * Get supplier contract statistics
   * @returns {Promise<Object>} Supplier contract statistics
   */
  getSupplierContractStats: async () => {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_contracts,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_contracts,
          COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_contracts,
          COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated_contracts,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_contracts,
          SUM(total_value) as total_contract_value,
          AVG(total_value) as avg_contract_value,
          COUNT(CASE WHEN end_date <= CURRENT_DATE + INTERVAL '90 days' AND status = 'active' THEN 1 END) as expiring_soon
        FROM supplier_contracts
      `;
      
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error in getSupplierContractStats:', error);
      return {
        total_contracts: 0,
        active_contracts: 0,
        expired_contracts: 0,
        terminated_contracts: 0,
        draft_contracts: 0,
        total_contract_value: 0,
        avg_contract_value: 0,
        expiring_soon: 0
      };
    }
  }
};

export default supplierManagementModel;
