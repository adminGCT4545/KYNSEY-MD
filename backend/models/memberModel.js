import pg from 'pg';
import fs from 'fs';
import path from 'path';
const { Pool } = pg;

// Use the global pool if available, otherwise create a new one
const pool = global.pgPool || new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'timewise_procument',
  port: parseInt(process.env.PGPORT || '5432'),
});

// Simple in-memory cache
const cache = {
  members: new Map(),
  membershipTypes: null,
  stats: null,
  expiringMembers: null,
  lastUpdated: {
    members: 0,
    membershipTypes: 0,
    stats: 0,
    expiringMembers: 0
  },
  ttl: 5 * 60 * 1000 // 5 minutes cache TTL
};

// Path to the membership SQL file that needs to be updated
const MEMBERSHIP_SQL_PATH = path.resolve(process.cwd(), 'membership-KYNSEY/membership/membership.sql');

/**
 * Append member data as an SQL INSERT statement to the membership.sql file
 * @param {Object} memberData - The member data to format as SQL
 * @returns {Promise<boolean>} - True if successful
 */
const appendMemberToSqlFile = async (memberData) => {
  try {
    // Format the member data as an SQL INSERT statement
    const {
      first_name, last_name, email, phone, 
      address_line1, address_line2, city, state, postal_code, country,
      membership_type, join_date, expiration_date, status, points,
      last_login, referral_source, notes
    } = memberData;

    // Create SQL insert statement
    let sql = `
-- Newly added member through UI
INSERT INTO members (
    first_name, last_name, email, phone, 
    address_line1, address_line2, city, state, postal_code, country,
    membership_type, join_date, expiration_date, status, points, 
    last_login, referral_source, notes
) VALUES
    ('${first_name}', '${last_name}', '${email}', '${phone || null}', 
     '${address_line1 || null}', ${address_line2 ? `'${address_line2}'` : 'NULL'}, '${city || null}', '${state || null}', '${postal_code || null}', '${country || null}', 
     '${membership_type}', '${join_date}', '${expiration_date}', '${status || 'active'}', ${points || 0}, 
     ${last_login ? `'${last_login}'` : 'NULL'}, ${referral_source ? `'${referral_source}'` : 'NULL'}, ${notes ? `'${notes}'` : 'NULL'});
`;

    // Check if file exists
    if (!fs.existsSync(MEMBERSHIP_SQL_PATH)) {
      console.error(`Membership SQL file not found at: ${MEMBERSHIP_SQL_PATH}`);
      return false;
    }

    // Append to file
    await fs.promises.appendFile(MEMBERSHIP_SQL_PATH, sql);
    console.log(`Successfully appended new member to SQL file: ${MEMBERSHIP_SQL_PATH}`);
    return true;
  } catch (error) {
    console.error('Error appending member to SQL file:', error);
    return false;
  }
};

const memberModel = {
  /**
   * Clear the cache
   */
  clearCache() {
    cache.members.clear();
    cache.membershipTypes = null;
    cache.stats = null;
    cache.expiringMembers = null;
    cache.lastUpdated.members = 0;
    cache.lastUpdated.membershipTypes = 0;
    cache.lastUpdated.stats = 0;
    cache.lastUpdated.expiringMembers = 0;
    console.log('Member cache cleared');
  },

  /**
   * Get all members with optional filtering
   * @param {string} status - Filter by status
   * @param {string} membershipType - Filter by membership type
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} - Array of member objects
   */
  async getAllMembers(status = null, membershipType = null, limit = 100) {
    try {
      // Check cache first
      const cacheKey = `${status || 'all'}-${membershipType || 'all'}-${limit}`;
      if (cache.members.has(cacheKey) && 
          (Date.now() - cache.lastUpdated.members) < cache.ttl) {
        return cache.members.get(cacheKey);
      }

      const result = await pool.query('EXECUTE get_all_members($1, $2, $3)', 
        [status, membershipType, limit]);
      
      // Update cache
      cache.members.set(cacheKey, result.rows);
      cache.lastUpdated.members = Date.now();
      
      return result.rows;
    } catch (error) {
      console.error('Error in getAllMembers:', error);
      throw error;
    }
  },

  /**
   * Get a member by ID
   * @param {number} memberId - The member ID
   * @returns {Promise<Object>} - Member object
   */
  async getMemberById(memberId) {
    try {
      // Check cache first
      const cacheKey = `id-${memberId}`;
      if (cache.members.has(cacheKey) && 
          (Date.now() - cache.lastUpdated.members) < cache.ttl) {
        return cache.members.get(cacheKey);
      }

      const result = await pool.query('EXECUTE get_member_by_id($1)', [memberId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Update cache
      cache.members.set(cacheKey, result.rows[0]);
      cache.lastUpdated.members = Date.now();
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error in getMemberById for ID ${memberId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new member
   * @param {Object} memberData - Member data
   * @returns {Promise<Object>} - Created member
   */
  async createMember(memberData) {
    try {
      const {
        first_name, last_name, email, phone, 
        address_line1, address_line2, city, state, postal_code, country,
        membership_type, join_date, expiration_date, status, points,
        referral_source, notes
      } = memberData;

      const result = await pool.query(
        `INSERT INTO members (
          first_name, last_name, email, phone, 
          address_line1, address_line2, city, state, postal_code, country,
          membership_type, join_date, expiration_date, status, points,
          referral_source, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          first_name, last_name, email, phone, 
          address_line1, address_line2, city, state, postal_code, country,
          membership_type, join_date, expiration_date, status || 'active', points || 0,
          referral_source, notes
        ]
      );

      // Clear cache
      this.clearCache();
      
      // Add the new member to the SQL file
      try {
        await appendMemberToSqlFile(result.rows[0]);
      } catch (sqlFileError) {
        // Log the error but don't fail the operation
        console.error('Failed to append member to SQL file, but database insert was successful:', sqlFileError);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in createMember:', error);
      throw error;
    }
  },

  /**
   * Update an existing member
   * @param {number} memberId - Member ID
   * @param {Object} memberData - Updated member data
   * @returns {Promise<Object>} - Updated member
   */
  async updateMember(memberId, memberData) {
    try {
      // Check if member exists
      const existingMember = await this.getMemberById(memberId);
      if (!existingMember) {
        throw new Error(`Member with ID ${memberId} not found`);
      }

      const {
        first_name, last_name, email, phone, 
        address_line1, address_line2, city, state, postal_code, country,
        membership_type, join_date, expiration_date, status, points,
        referral_source, notes
      } = memberData;

      const result = await pool.query(
        `UPDATE members SET
          first_name = $1,
          last_name = $2,
          email = $3,
          phone = $4,
          address_line1 = $5,
          address_line2 = $6,
          city = $7,
          state = $8,
          postal_code = $9,
          country = $10,
          membership_type = $11,
          join_date = $12,
          expiration_date = $13,
          status = $14,
          points = $15,
          referral_source = $16,
          notes = $17,
          updated_at = CURRENT_TIMESTAMP
        WHERE member_id = $18
        RETURNING *`,
        [
          first_name, last_name, email, phone, 
          address_line1, address_line2, city, state, postal_code, country,
          membership_type, join_date, expiration_date, status, points,
          referral_source, notes, memberId
        ]
      );

      // Clear cache
      this.clearCache();
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error in updateMember for ID ${memberId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a member
   * @param {number} memberId - Member ID
   * @returns {Promise<Object>} - Deleted member
   */
  async deleteMember(memberId) {
    try {
      // Check if member exists
      const existingMember = await this.getMemberById(memberId);
      if (!existingMember) {
        throw new Error(`Member with ID ${memberId} not found`);
      }

      const result = await pool.query(
        'DELETE FROM members WHERE member_id = $1 RETURNING *',
        [memberId]
      );

      // Clear cache
      this.clearCache();
      
      return { success: true, deletedMember: result.rows[0] };
    } catch (error) {
      console.error(`Error in deleteMember for ID ${memberId}:`, error);
      throw error;
    }
  },

  /**
   * Get all membership types
   * @returns {Promise<Array>} - Array of membership type objects
   */
  async getMembershipTypes() {
    try {
      // Check cache first
      if (cache.membershipTypes && 
          (Date.now() - cache.lastUpdated.membershipTypes) < cache.ttl) {
        return cache.membershipTypes;
      }

      const result = await pool.query(
        'SELECT * FROM membership_types ORDER BY monthly_fee'
      );
      
      // Update cache
      cache.membershipTypes = result.rows;
      cache.lastUpdated.membershipTypes = Date.now();
      
      return result.rows;
    } catch (error) {
      console.error('Error in getMembershipTypes:', error);
      throw error;
    }
  },

  /**
   * Get activities for a specific member
   * @param {number} memberId - Member ID
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} - Array of activity objects
   */
  async getMemberActivities(memberId, limit = 20) {
    try {
      const result = await pool.query(
        `SELECT * FROM activity_log 
         WHERE member_id = $1 
         ORDER BY activity_date DESC 
         LIMIT $2`,
        [memberId, limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error(`Error in getMemberActivities for member ID ${memberId}:`, error);
      throw error;
    }
  },

  /**
   * Add an activity for a member
   * @param {Object} activityData - Activity data
   * @returns {Promise<Object>} - Created activity
   */
  async addMemberActivity(activityData) {
    try {
      const {
        member_id, activity_type, activity_date, points_earned, details
      } = activityData;

      // Check if member exists
      const existingMember = await this.getMemberById(member_id);
      if (!existingMember) {
        throw new Error(`Member with ID ${member_id} not found`);
      }

      // Start a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Add activity
        const activityResult = await client.query(
          `INSERT INTO activity_log (
            member_id, activity_type, activity_date, points_earned, details
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING *`,
          [
            member_id, activity_type, 
            activity_date || 'NOW()', 
            points_earned || 0, 
            details
          ]
        );

        // Update member points
        await client.query(
          `UPDATE members 
           SET points = points + $1, updated_at = CURRENT_TIMESTAMP
           WHERE member_id = $2`,
          [points_earned || 0, member_id]
        );

        await client.query('COMMIT');

        // Clear cache
        this.clearCache();
        
        return activityResult.rows[0];
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error in addMemberActivity:', error);
      throw error;
    }
  },

  /**
   * Get members with expiring memberships
   * @param {number} days - Days until expiration
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} - Array of member objects
   */
  async getExpiringMemberships(days = 30, limit = 100) {
    try {
      // Check cache first
      const cacheKey = `expiring-${days}-${limit}`;
      if (cache.expiringMembers && 
          (Date.now() - cache.lastUpdated.expiringMembers) < cache.ttl) {
        return cache.expiringMembers;
      }

      const result = await pool.query('EXECUTE get_expiring_memberships($1, $2)', 
        [days, limit]);
      
      // Update cache
      cache.expiringMembers = result.rows;
      cache.lastUpdated.expiringMembers = Date.now();
      
      return result.rows;
    } catch (error) {
      console.error(`Error in getExpiringMemberships for ${days} days:`, error);
      throw error;
    }
  },

  /**
   * Get membership statistics
   * @returns {Promise<Object>} - Statistics object
   */
  async getMemberStats() {
    try {
      // Check cache first
      if (cache.stats && 
          (Date.now() - cache.lastUpdated.stats) < cache.ttl) {
        return cache.stats;
      }

      // Get overall stats
      const overallResult = await pool.query(`
        SELECT 
          COUNT(*) as "totalMembers",
          SUM(points) as "totalPoints",
          AVG(points) as "avgPoints"
        FROM members
      `);

      // Get stats by membership type
      const byTypeResult = await pool.query(`
        SELECT 
          membership_type as "membershipType",
          COUNT(*) as "memberCount",
          SUM(points) as "totalPoints",
          AVG(points) as "avgPoints"
        FROM members
        GROUP BY membership_type
        ORDER BY COUNT(*) DESC
      `);

      // Get stats by status
      const byStatusResult = await pool.query(`
        SELECT 
          status,
          COUNT(*) as "memberCount"
        FROM members
        GROUP BY status
        ORDER BY COUNT(*) DESC
      `);

      const stats = {
        overall: overallResult.rows[0],
        byType: byTypeResult.rows,
        byStatus: byStatusResult.rows
      };
      
      // Update cache
      cache.stats = stats;
      cache.lastUpdated.stats = Date.now();
      
      return stats;
    } catch (error) {
      console.error('Error in getMemberStats:', error);
      throw error;
    }
  }
};

export default memberModel;
