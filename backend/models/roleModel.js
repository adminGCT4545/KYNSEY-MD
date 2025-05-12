const { Pool } = require('pg');
const config = require('../utils/config');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.databaseUrl,
});

/**
 * Role Model - Manages the Role-Based Access Control (RBAC) system
 * Provides a hierarchical permission structure for user authorization
 */
class RoleModel {
  /**
   * Create a new role in the system
   * @param {Object} role - Role object with name, description, and permissions
   * @returns {Promise<Object>} Created role
   */
  async createRole(role) {
    const { name, description, permissions } = role;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert role into roles table
      const roleQuery = `
        INSERT INTO roles (name, description)
        VALUES ($1, $2)
        RETURNING id, name, description, created_at, updated_at
      `;
      const roleResult = await client.query(roleQuery, [name, description]);
      const roleId = roleResult.rows[0].id;
      
      // Insert role permissions
      if (permissions && permissions.length > 0) {
        const permissionValues = permissions.map((permission, index) => {
          return `($1, $${index + 2})`;
        }).join(', ');
        
        const permissionQuery = `
          INSERT INTO role_permissions (role_id, permission)
          VALUES ${permissionValues}
        `;
        
        const permissionParams = [roleId, ...permissions];
        await client.query(permissionQuery, permissionParams);
      }
      
      await client.query('COMMIT');
      
      // Return the created role with permissions
      return {
        ...roleResult.rows[0],
        permissions: permissions || []
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Get a role by ID with its permissions
   * @param {string} id - Role ID
   * @returns {Promise<Object|null>} Role object or null if not found
   */
  async getRoleById(id) {
    const roleQuery = `
      SELECT r.id, r.name, r.description, r.created_at, r.updated_at
      FROM roles r
      WHERE r.id = $1
    `;
    
    const permissionQuery = `
      SELECT permission
      FROM role_permissions
      WHERE role_id = $1
    `;
    
    const client = await pool.connect();
    try {
      // Get role details
      const roleResult = await client.query(roleQuery, [id]);
      if (roleResult.rowCount === 0) {
        return null;
      }
      
      // Get role permissions
      const permissionResult = await client.query(permissionQuery, [id]);
      const permissions = permissionResult.rows.map(row => row.permission);
      
      // Return role with permissions
      return {
        ...roleResult.rows[0],
        permissions
      };
    } finally {
      client.release();
    }
  }
  
  /**
   * Get all roles in the system
   * @returns {Promise<Array>} List of roles
   */
  async getAllRoles() {
    const query = `
      SELECT r.id, r.name, r.description, r.created_at, r.updated_at,
             ARRAY_AGG(rp.permission) AS permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id
      ORDER BY r.name
    `;
    
    const result = await pool.query(query);
    return result.rows.map(row => ({
      ...row,
      permissions: row.permissions[0] === null ? [] : row.permissions
    }));
  }
  
  /**
   * Update an existing role
   * @param {string} id - Role ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated role or null if not found
   */
  async updateRole(id, updates) {
    const { name, description, permissions } = updates;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update role in roles table
      const updateFields = [];
      const params = [id];
      let paramIndex = 2;
      
      if (name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        params.push(name);
      }
      
      if (description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        params.push(description);
      }
      
      if (updateFields.length > 0) {
        const roleQuery = `
          UPDATE roles
          SET ${updateFields.join(', ')}, updated_at = NOW()
          WHERE id = $1
          RETURNING id, name, description, created_at, updated_at
        `;
        
        const roleResult = await client.query(roleQuery, params);
        if (roleResult.rowCount === 0) {
          await client.query('ROLLBACK');
          return null;
        }
      }
      
      // Update permissions if provided
      if (permissions !== undefined) {
        // Delete existing permissions
        await client.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);
        
        // Insert new permissions
        if (permissions.length > 0) {
          const permissionValues = permissions.map((_, index) => {
            return `($1, $${index + 2})`;
          }).join(', ');
          
          const permissionQuery = `
            INSERT INTO role_permissions (role_id, permission)
            VALUES ${permissionValues}
          `;
          
          const permissionParams = [id, ...permissions];
          await client.query(permissionQuery, permissionParams);
        }
      }
      
      await client.query('COMMIT');
      
      // Return updated role
      return await this.getRoleById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Delete a role by ID
   * @param {string} id - Role ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteRole(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete role permissions
      await client.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);
      
      // Delete role
      const result = await client.query('DELETE FROM roles WHERE id = $1', [id]);
      
      await client.query('COMMIT');
      
      return result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Check if user has specific permission
   * @param {string} userId - User ID
   * @param {string} permission - Permission to check
   * @returns {Promise<boolean>} True if user has permission
   */
  async hasPermission(userId, permission) {
    const query = `
      SELECT COUNT(*) > 0 AS has_permission
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      WHERE u.id = $1 AND rp.permission = $2
    `;
    
    const result = await pool.query(query, [userId, permission]);
    return result.rows[0].has_permission;
  }
  
  /**
   * Get all permissions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of permissions
   */
  async getUserPermissions(userId) {
    const query = `
      SELECT DISTINCT rp.permission
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      WHERE u.id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => row.permission);
  }
  
  /**
   * Assign role to user
   * @param {string} userId - User ID
   * @param {string} roleId - Role ID
   * @returns {Promise<boolean>} True if assigned
   */
  async assignRoleToUser(userId, roleId) {
    try {
      const query = `
        INSERT INTO user_roles (user_id, role_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, role_id) DO NOTHING
        RETURNING user_id
      `;
      
      const result = await pool.query(query, [userId, roleId]);
      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Remove role from user
   * @param {string} userId - User ID
   * @param {string} roleId - Role ID
   * @returns {Promise<boolean>} True if removed
   */
  async removeRoleFromUser(userId, roleId) {
    try {
      const query = `
        DELETE FROM user_roles
        WHERE user_id = $1 AND role_id = $2
      `;
      
      const result = await pool.query(query, [userId, roleId]);
      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get all users with a specific role
   * @param {string} roleId - Role ID
   * @returns {Promise<Array>} List of users
   */
  async getUsersByRole(roleId) {
    const query = `
      SELECT u.id, u.username, u.email, u.first_name, u.last_name
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.role_id = $1
      ORDER BY u.last_name, u.first_name
    `;
    
    const result = await pool.query(query, [roleId]);
    return result.rows;
  }
  
  /**
   * Initialize default roles
   * Creates standard medical system roles if they don't exist
   * @returns {Promise<void>}
   */
  async initializeDefaultRoles() {
    const defaultRoles = [
      {
        name: 'Administrator',
        description: 'System administrator with full access',
        permissions: [
          'users:create', 'users:read', 'users:update', 'users:delete',
          'roles:create', 'roles:read', 'roles:update', 'roles:delete',
          'patients:create', 'patients:read', 'patients:update', 'patients:delete',
          'appointments:create', 'appointments:read', 'appointments:update', 'appointments:delete',
          'billing:create', 'billing:read', 'billing:update', 'billing:delete',
          'reports:create', 'reports:read',
          'settings:update'
        ]
      },
      {
        name: 'Doctor',
        description: 'Medical doctor with clinical access',
        permissions: [
          'patients:read', 'patients:update',
          'appointments:read', 'appointments:update',
          'medical_records:create', 'medical_records:read', 'medical_records:update',
          'prescriptions:create', 'prescriptions:read', 'prescriptions:update',
          'lab_results:create', 'lab_results:read',
          'reports:read'
        ]
      },
      {
        name: 'Nurse',
        description: 'Nurse with clinical support access',
        permissions: [
          'patients:read',
          'appointments:read', 'appointments:update',
          'medical_records:read', 'medical_records:update',
          'prescriptions:read',
          'lab_results:read',
          'vitals:create', 'vitals:read', 'vitals:update'
        ]
      },
      {
        name: 'Receptionist',
        description: 'Front desk staff for patient management',
        permissions: [
          'patients:create', 'patients:read', 'patients:update',
          'appointments:create', 'appointments:read', 'appointments:update', 'appointments:delete',
          'billing:read'
        ]
      },
      {
        name: 'Billing',
        description: 'Billing and financial staff',
        permissions: [
          'patients:read',
          'appointments:read',
          'billing:create', 'billing:read', 'billing:update', 'billing:delete',
          'reports:read'
        ]
      }
    ];
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const role of defaultRoles) {
        // Check if role exists
        const existingRole = await client.query(
          'SELECT id FROM roles WHERE name = $1',
          [role.name]
        );
        
        if (existingRole.rowCount === 0) {
          // Create role
          const roleResult = await client.query(
            'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id',
            [role.name, role.description]
          );
          
          const roleId = roleResult.rows[0].id;
          
          // Create permissions
          for (const permission of role.permissions) {
            await client.query(
              'INSERT INTO role_permissions (role_id, permission) VALUES ($1, $2)',
              [roleId, permission]
            );
          }
        }
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new RoleModel();