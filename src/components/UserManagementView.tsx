import React, { useState, useEffect, useMemo } from 'react';
import { Button, Dialog, Form, Input, Table, Select, Tag, Tabs, message, Modal, Spin, Popconfirm } from 'antd';
import { UserOutlined, LockOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SecurityScanOutlined } from '@ant-design/icons';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface Permission {
  name: string;
  description: string;
  category: string;
}

interface UserFormProps {
  user?: User;
  roles: Role[];
  onSave: (values: any) => void;
  onCancel: () => void;
}

// User Form Component
const UserForm: React.FC<UserFormProps> = ({ user, roles, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        ...user,
        roles: user.roles || []
      });
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        onSave(values);
        form.resetFields();
      })
      .catch(err => {
        console.error('Form validation failed:', err);
      });
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Please enter first name' }]}>
        <Input placeholder="First Name" />
      </Form.Item>
      
      <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Please enter last name' }]}>
        <Input placeholder="Last Name" />
      </Form.Item>
      
      <Form.Item name="email" label="Email" rules={[
        { required: true, message: 'Please enter email' },
        { type: 'email', message: 'Please enter a valid email' }
      ]}>
        <Input placeholder="Email" prefix={<UserOutlined />} />
      </Form.Item>
      
      <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please enter username' }]}>
        <Input placeholder="Username" prefix={<UserOutlined />} />
      </Form.Item>
      
      {!isEditing && (
        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter password' }]}>
          <Input.Password placeholder="Password" prefix={<LockOutlined />} />
        </Form.Item>
      )}
      
      <Form.Item name="roles" label="Roles" rules={[{ required: true, message: 'Please select at least one role' }]}>
        <Select 
          mode="multiple" 
          placeholder="Select roles" 
          optionFilterProp="label"
        >
          {roles.map(role => (
            <Select.Option key={role.id} value={role.id} label={role.name}>
              {role.name} - {role.description}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item name="active" label="Status" valuePropName="checked">
        <Select defaultValue={true}>
          <Select.Option value={true}>Active</Select.Option>
          <Select.Option value={false}>Inactive</Select.Option>
        </Select>
      </Form.Item>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" onClick={handleSubmit}>
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </Form>
  );
};

/**
 * User Management View Component
 * Provides administrative interface for managing users, roles, and permissions
 */
const UserManagementView: React.FC = () => {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, rolesRes, permissionsRes] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/roles'),
          axios.get('/api/permissions')
        ]);
        
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
        setPermissions(permissionsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to load user management data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    
    return users.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // User CRUD operations
  const handleAddUser = () => {
    setSelectedUser(undefined);
    setIsUserModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserModalVisible(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      message.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    }
  };

  const handleSaveUser = async (values: any) => {
    try {
      if (selectedUser) {
        // Update existing user
        const response = await axios.put(`/api/users/${selectedUser.id}`, values);
        setUsers(users.map(user => user.id === selectedUser.id ? response.data : user));
        message.success('User updated successfully');
      } else {
        // Create new user
        const response = await axios.post('/api/users', values);
        setUsers([...users, response.data]);
        message.success('User created successfully');
      }
      setIsUserModalVisible(false);
    } catch (error) {
      console.error('Error saving user:', error);
      message.error('Failed to save user');
    }
  };

  // Role operations
  const handleAddRole = () => {
    // Implementation for adding a new role
    setIsRoleModalVisible(true);
  };

  // User table columns
  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (_: any, record: User) => `${record.firstName} ${record.lastName}`
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <span>
          {roles.map(role => {
            const roleObj = roles.find(r => r.id === role);
            return (
              <Tag color="blue" key={role}>
                {roleObj ? roleObj.name : role}
              </Tag>
            );
          })}
        </span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (lastLogin: string) => lastLogin ? new Date(lastLogin).toLocaleString() : 'Never'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <span>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditUser(record)}
            title="Edit User"
          />
          <Button 
            type="text" 
            icon={<SecurityScanOutlined />} 
            onClick={() => {/* Handle security settings */}}
            title="Security Settings"
          />
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              title="Delete User"
            />
          </Popconfirm>
        </span>
      )
    }
  ];

  // Role table columns
  const roleColumns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <span>
          {permissions.length} permissions
          {permissions.length > 0 && (
            <Button type="link" size="small">View</Button>
          )}
        </span>
      )
    },
    {
      title: 'Users',
      key: 'users',
      render: (record: Role) => {
        const usersWithRole = users.filter(user => user.roles.includes(record.id));
        return usersWithRole.length;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Role) => (
        <span>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => {/* Handle edit role */}}
          />
          <Popconfirm
            title="Are you sure you want to delete this role?"
            onConfirm={() => {/* Handle delete role */}}
            okText="Yes"
            cancelText="No"
            disabled={record.name === 'Administrator'}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              disabled={record.name === 'Administrator'}
            />
          </Popconfirm>
        </span>
      )
    }
  ];

  return (
    <div className="user-management-container">
      <h1>User Management</h1>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Users" key="users">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Input.Search
              placeholder="Search users..."
              onSearch={value => setSearchQuery(value)}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </div>
          
          <Table 
            dataSource={filteredUsers}
            columns={userColumns}
            rowKey="id"
            loading={loading}
          />
        </Tabs.TabPane>
        
        <Tabs.TabPane tab="Roles" key="roles">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddRole}
            >
              Add Role
            </Button>
          </div>
          
          <Table 
            dataSource={roles}
            columns={roleColumns}
            rowKey="id"
            loading={loading}
          />
        </Tabs.TabPane>
        
        <Tabs.TabPane tab="Permissions" key="permissions">
          {/* Permissions management UI */}
        </Tabs.TabPane>
        
        <Tabs.TabPane tab="Security Settings" key="security">
          {/* Global security settings */}
        </Tabs.TabPane>
      </Tabs>
      
      {/* User Modal */}
      <Modal
        title={selectedUser ? "Edit User" : "Add New User"}
        open={isUserModalVisible}
        onCancel={() => setIsUserModalVisible(false)}
        footer={null}
        width={600}
      >
        <UserForm 
          user={selectedUser}
          roles={roles}
          onSave={handleSaveUser}
          onCancel={() => setIsUserModalVisible(false)}
        />
      </Modal>
      
      {/* Role Modal */}
      <Modal
        title="Add New Role"
        open={isRoleModalVisible}
        onCancel={() => setIsRoleModalVisible(false)}
        footer={null}
        width={700}
      >
        {/* Role Form */}
      </Modal>
    </div>
  );
};

export default UserManagementView;