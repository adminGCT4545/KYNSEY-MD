// This service fetches member data from the PostgreSQL database
import { query } from './dbService';
import { Member } from './dataService';

/**
 * Fetches 25 members from the PostgreSQL database
 * @returns Promise<Member[]> Array of member objects
 */
export const fetchMembersFromDatabase = async (): Promise<Member[]> => {
  try {
    console.log('Fetching members from PostgreSQL database...');
    
    // Query to fetch 25 members from the database
    const result = await query(
      `SELECT 
        member_id, first_name, last_name, email, phone, 
        address_line1, address_line2, city, state, postal_code, country,
        membership_type, join_date, expiration_date, status, points, 
        last_login, referral_source, referred_by, is_primary_account, 
        primary_account_id, birthdate, email_opt_in, sms_opt_in, notes,
        created_at, updated_at
      FROM members 
      ORDER BY last_name, first_name 
      LIMIT 25`,
      []
    );
    
    console.log(`Successfully fetched ${result.rows.length} members from database`);
    return result.rows;
  } catch (error) {
    console.error('Error fetching members from database:', error);
    throw error;
  }
};

/**
 * Fetches membership types from the PostgreSQL database
 * @returns Promise<any[]> Array of membership type objects
 */
export const fetchMembershipTypes = async (): Promise<any[]> => {
  try {
    console.log('Fetching membership types from PostgreSQL database...');
    
    // Query to fetch membership types from the database
    const result = await query(
      `SELECT 
        type_id, type_name, monthly_fee, annual_fee, benefits, points_multiplier
      FROM membership_types 
      ORDER BY monthly_fee`,
      []
    );
    
    console.log(`Successfully fetched ${result.rows.length} membership types from database`);
    return result.rows;
  } catch (error) {
    console.error('Error fetching membership types from database:', error);
    throw error;
  }
};

/**
 * Fetches expiring memberships from the PostgreSQL database
 * @param days Number of days until expiration
 * @returns Promise<any[]> Array of expiring membership objects
 */
export const fetchExpiringMemberships = async (days: number = 30): Promise<any[]> => {
  try {
    console.log(`Fetching memberships expiring within ${days} days...`);
    
    // Query to fetch expiring memberships
    const result = await query(
      `SELECT 
        member_id, first_name, last_name, email, phone,
        membership_type, join_date, expiration_date, status,
        (expiration_date - CURRENT_DATE) AS days_remaining
      FROM members
      WHERE status = 'active' 
        AND expiration_date < (CURRENT_DATE + $1 * INTERVAL '1 day')
      ORDER BY expiration_date ASC
      LIMIT 25`,
      [days]
    );
    
    console.log(`Successfully fetched ${result.rows.length} expiring memberships from database`);
    return result.rows;
  } catch (error) {
    console.error('Error fetching expiring memberships from database:', error);
    throw error;
  }
};

/**
 * Fetches membership statistics from the PostgreSQL database
 * @returns Promise<any> Object containing membership statistics
 */
export const fetchMembershipStats = async (): Promise<any> => {
  try {
    console.log('Fetching membership statistics from PostgreSQL database...');
    
    // Query to fetch overall stats
    const overallResult = await query(
      `SELECT 
        COUNT(*) as "totalMembers",
        SUM(points) as "totalPoints",
        AVG(points) as "avgPoints"
      FROM members`,
      []
    );
    
    // Query to fetch stats by membership type
    const byTypeResult = await query(
      `SELECT 
        membership_type as "membershipType",
        COUNT(*) as "memberCount",
        SUM(points) as "totalPoints",
        AVG(points) as "avgPoints"
      FROM members
      GROUP BY membership_type
      ORDER BY COUNT(*) DESC`,
      []
    );
    
    // Query to fetch stats by status
    const byStatusResult = await query(
      `SELECT 
        status,
        COUNT(*) as "memberCount"
      FROM members
      GROUP BY status
      ORDER BY COUNT(*) DESC`,
      []
    );
    
    const stats = {
      overall: overallResult.rows[0],
      byType: byTypeResult.rows,
      byStatus: byStatusResult.rows
    };
    
    console.log('Successfully fetched membership statistics from database');
    return stats;
  } catch (error) {
    console.error('Error fetching membership statistics from database:', error);
    throw error;
  }
};

/**
 * Fetches member activities from the PostgreSQL database
 * @param memberId ID of the member
 * @returns Promise<any[]> Array of member activity objects
 */
export const fetchMemberActivities = async (memberId: number): Promise<any[]> => {
  try {
    console.log(`Fetching activities for member ID ${memberId}...`);
    
    // Query to fetch member activities
    const result = await query(
      `SELECT 
        log_id, member_id, activity_type, activity_date, 
        points_earned, details
      FROM activity_log 
      WHERE member_id = $1 
      ORDER BY activity_date DESC 
      LIMIT 20`,
      [memberId]
    );
    
    console.log(`Successfully fetched ${result.rows.length} activities for member ID ${memberId}`);
    return result.rows;
  } catch (error) {
    console.error(`Error fetching activities for member ID ${memberId}:`, error);
    throw error;
  }
};

export default {
  fetchMembersFromDatabase,
  fetchMembershipTypes,
  fetchExpiringMemberships,
  fetchMembershipStats,
  fetchMemberActivities
};
