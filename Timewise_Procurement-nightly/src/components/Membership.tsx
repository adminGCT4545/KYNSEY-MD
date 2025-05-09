import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Tabs, Card, Statistic, Tag, Spin, message } from 'antd';
import { UserOutlined, TeamOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import memberService from '../services/memberService';

const { TabPane } = Tabs;
const { Option } = Select;

interface Member {
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  membership_type: string;
  join_date: string;
  expiration_date: string;
  status: string;
  points: number;
  last_login: string | null;
  referral_source: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

interface MembershipType {
  type_id: number;
  type_name: string;
  monthly_fee: number;
  annual_fee?: number;
  benefits?: string;
  points_multiplier: number;
}

interface Activity {
  log_id: number;
  member_id: number;
  activity_type: string;
  activity_date: string;
  points_earned: number;
  details: string | null;
}

interface MemberStats {
  overall: {
    totalMembers: number;
    totalPoints: number;
    avgPoints: number;
  };
  byType: Array<{
    membershipType: string;
    memberCount: number;
    totalPoints: number;
    avgPoints: number;
  }>;
  byStatus: Array<{
    status: string;
    memberCount: number;
  }>;
}

// Define column types for Table
interface TableColumnType {
  title: string;
  dataIndex?: string;
  key: string;
  width?: number;
  render?: (text: any, record: any) => React.ReactNode;
  sorter?: (a: any, b: any) => number;
  filters?: Array<{ text: string; value: string }>;
  onFilter?: (value: any, record: any) => boolean;
}

const Membership: React.FC = () => {
  // State for members data
  const [members, setMembers] = useState<Member[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [expiringMembers, setExpiringMembers] = useState<any[]>([]);
  
  // State for modal
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [form] = Form.useForm();
  
  // State for activity modal
  const [isActivityModalVisible, setIsActivityModalVisible] = useState<boolean>(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityForm] = Form.useForm();
  
  // State for member profile modal
  const [isProfileModalVisible, setIsProfileModalVisible] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Fetch members data
  const fetchMembers = async (): Promise<void> => {
    try {
      setLoading(true);
      // Use the memberService to fetch data from PostgreSQL
      const data = await memberService.fetchMembersFromDatabase();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      message.error('Failed to load members data');
      
      // Fallback to API if database query fails
      try {
        const response = await fetch('/api/member-management/members');
        if (!response.ok) throw new Error('Failed to fetch members from API');
        const data = await response.json();
        setMembers(data);
      } catch (apiError) {
        console.error('Error fetching members from API:', apiError);
        message.error('Failed to load members data from all sources');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch membership types
  const fetchMembershipTypes = async (): Promise<void> => {
    try {
      // Use the memberService to fetch membership types from PostgreSQL
      const data = await memberService.fetchMembershipTypes();
      setMembershipTypes(data);
    } catch (error) {
      console.error('Error fetching membership types:', error);
      message.error('Failed to load membership types');
      
      // Fallback to API if database query fails
      try {
        const response = await fetch('/api/member-management/membership-types');
        if (!response.ok) throw new Error('Failed to fetch membership types from API');
        const data = await response.json();
        setMembershipTypes(data);
      } catch (apiError) {
        console.error('Error fetching membership types from API:', apiError);
        message.error('Failed to load membership types from all sources');
      }
    }
  };
  
  // Fetch membership stats
  const fetchStats = async (): Promise<void> => {
    try {
      // Use the memberService to fetch stats from PostgreSQL
      const data = await memberService.fetchMembershipStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching membership stats:', error);
      message.error('Failed to load membership statistics');
      
      // Fallback to API if database query fails
      try {
        const response = await fetch('/api/member-management/stats');
        if (!response.ok) throw new Error('Failed to fetch membership stats from API');
        const data = await response.json();
        setStats(data);
      } catch (apiError) {
        console.error('Error fetching membership stats from API:', apiError);
        message.error('Failed to load membership statistics from all sources');
      }
    }
  };
  
  // Fetch expiring memberships
  const fetchExpiringMemberships = async (): Promise<void> => {
    try {
      // Use the memberService to fetch expiring memberships from PostgreSQL
      const data = await memberService.fetchExpiringMemberships(30); // 30 days
      setExpiringMembers(data);
    } catch (error) {
      console.error('Error fetching expiring memberships:', error);
      message.error('Failed to load expiring memberships');
      
      // Fallback to API if database query fails
      try {
        const response = await fetch('/api/member-management/expiring');
        if (!response.ok) throw new Error('Failed to fetch expiring memberships from API');
        const data = await response.json();
        setExpiringMembers(data);
      } catch (apiError) {
        console.error('Error fetching expiring memberships from API:', apiError);
        message.error('Failed to load expiring memberships from all sources');
      }
    }
  };
  
  // Fetch member activities
  const fetchMemberActivities = async (memberId: number): Promise<void> => {
    try {
      // Use the memberService to fetch member activities from PostgreSQL
      const data = await memberService.fetchMemberActivities(memberId);
      setActivities(data);
    } catch (error) {
      console.error('Error fetching member activities:', error);
      message.error('Failed to load member activities');
      
      // Fallback to API if database query fails
      try {
        const response = await fetch(`/api/member-management/members/${memberId}/activities`);
        if (!response.ok) throw new Error('Failed to fetch member activities from API');
        const data = await response.json();
        setActivities(data);
      } catch (apiError) {
        console.error('Error fetching member activities from API:', apiError);
        message.error('Failed to load member activities from all sources');
      }
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchMembers();
    fetchMembershipTypes();
    fetchStats();
    fetchExpiringMemberships();
  }, []);
  
  // Handle modal open for adding a new member
  const showAddModal = (): void => {
    setModalMode('add');
    setCurrentMember(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  
  // Handle modal open for editing a member
  const showEditModal = (member: Member): void => {
    setModalMode('edit');
    setCurrentMember(member);
    
    form.setFieldsValue({
      ...member,
      join_date: member.join_date ? dayjs(member.join_date) : null,
      expiration_date: member.expiration_date ? dayjs(member.expiration_date) : null,
    });
    
    setIsModalVisible(true);
  };
  
  // Handle modal close
  const handleCancel = (): void => {
    setIsModalVisible(false);
    form.resetFields();
  };
  
  // Handle form submission
  const handleSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      
      // Format dates
      if (values.join_date) {
        values.join_date = values.join_date.format('YYYY-MM-DD');
      }
      
      if (values.expiration_date) {
        values.expiration_date = values.expiration_date.format('YYYY-MM-DD');
      }
      
      if (modalMode === 'add') {
        // Create new member
        const response = await fetch('/api/member-management/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) throw new Error('Failed to create member');
        
        message.success('Member created successfully');
      } else if (currentMember) {
        // Update existing member
        const response = await fetch(`/api/member-management/members/${currentMember.member_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) throw new Error('Failed to update member');
        
        message.success('Member updated successfully');
      }
      
      // Refresh data
      fetchMembers();
      fetchStats();
      fetchExpiringMemberships();
      
      // Close modal
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Failed to save member data');
    }
  };
  
  // Handle member deletion
  const handleDelete = async (memberId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/member-management/members/${memberId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete member');
      
      message.success('Member deleted successfully');
      
      // Refresh data
      fetchMembers();
      fetchStats();
      fetchExpiringMemberships();
    } catch (error) {
      console.error('Error deleting member:', error);
      message.error('Failed to delete member');
    }
  };
  
  // Show activity modal
  const showActivityModal = (memberId: number): void => {
    setSelectedMemberId(memberId);
    fetchMemberActivities(memberId);
    activityForm.resetFields();
    setIsActivityModalVisible(true);
  };
  
  // Fetch member details and show profile modal
  const showMemberProfile = async (memberId: number): Promise<void> => {
    try {
      console.log(`Attempting to fetch profile for member ID: ${memberId}`);
      setLoading(true);
      
      // For now, let's attempt to use a member directly from the existing list
      const existingMember = members.find(m => m.member_id === memberId);
      if (existingMember) {
        console.log('Found member in existing list:', existingMember);
        setSelectedMember(existingMember);
        
        // Also fetch the member's activities for the Activities tab
        fetchMemberActivities(memberId);
        
        setIsProfileModalVisible(true);
      } else {
        console.log('Member not found in existing list, attempting API call');
        // Fetch detailed member information
        const response = await fetch(`/api/member-management/members/${memberId}`);
        
        if (!response.ok) throw new Error('Failed to fetch member details');
        
        const memberData = await response.json();
        console.log('Received member data from API:', memberData);
        setSelectedMember(memberData);
        
        // Also fetch the member's activities for the Activities tab
        fetchMemberActivities(memberId);
        
        setIsProfileModalVisible(true);
      }
      console.log('Profile modal should now be visible');
    } catch (error) {
      console.error('Error fetching member details:', error);
      message.error('Failed to load member profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle profile modal close
  const handleProfileCancel = (): void => {
    setIsProfileModalVisible(false);
    setSelectedMember(null);
  };
  
  // Handle activity modal close
  const handleActivityCancel = (): void => {
    setIsActivityModalVisible(false);
    setSelectedMemberId(null);
    setActivities([]);
  };
  
  // Handle activity form submission
  const handleActivitySubmit = async (): Promise<void> => {
    try {
      const values = await activityForm.validateFields();
      
      // Format date
      if (values.activity_date) {
        values.activity_date = values.activity_date.format('YYYY-MM-DD HH:mm:ss');
      } else {
        values.activity_date = new Date().toISOString();
      }
      
      if (selectedMemberId === null) {
        message.error('No member selected');
        return;
      }
      
      // Add activity
      const response = await fetch(`/api/member-management/members/${selectedMemberId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) throw new Error('Failed to add activity');
      
      message.success('Activity added successfully');
      
      // Refresh activities
      fetchMemberActivities(selectedMemberId);
      
      // Reset form
      activityForm.resetFields();
    } catch (error) {
      console.error('Error adding activity:', error);
      message.error('Failed to add activity');
    }
  };
  
  // Table columns for members
  const columns: TableColumnType[] = [
    {
      title: 'ID',
      dataIndex: 'member_id',
      key: 'member_id',
      width: 80,
    },
    {
      title: 'Name',
      key: 'name',
      render: (_: any, record: Member) => (
        <Button 
          type="link" 
          onClick={() => showMemberProfile(record.member_id)}
          style={{ padding: 0 }}
        >
          {record.first_name} {record.last_name}
        </Button>
      ),
      sorter: (a: Member, b: Member) => `${a.last_name}${a.first_name}`.localeCompare(`${b.last_name}${b.first_name}`),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Membership',
      dataIndex: 'membership_type',
      key: 'membership_type',
      filters: membershipTypes.map(type => ({ text: type.type_name, value: type.type_name })),
      onFilter: (value: any, record: Member) => record.membership_type === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'expiring') color = 'orange';
        if (status === 'expired') color = 'red';
        if (status === 'suspended') color = 'volcano';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Expiring', value: 'expiring' },
        { text: 'Expired', value: 'expired' },
        { text: 'Suspended', value: 'suspended' },
      ],
      onFilter: (value: any, record: Member) => record.status === value,
    },
    {
      title: 'Join Date',
      dataIndex: 'join_date',
      key: 'join_date',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '',
      sorter: (a: Member, b: Member) => {
        const dateA = new Date(a.join_date).getTime();
        const dateB = new Date(b.join_date).getTime();
        return dateA - dateB;
      },
    },
    {
      title: 'Expiration',
      dataIndex: 'expiration_date',
      key: 'expiration_date',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '',
      sorter: (a: Member, b: Member) => {
        const dateA = new Date(a.expiration_date).getTime();
        const dateB = new Date(b.expiration_date).getTime();
        return dateA - dateB;
      },
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      sorter: (a: Member, b: Member) => a.points - b.points,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Member) => (
        <div className="flex space-x-2">
          <Button size="small" onClick={() => showActivityModal(record.member_id)}>Activities</Button>
          <Button size="small" type="primary" onClick={() => showEditModal(record)}>Edit</Button>
          <Button 
            size="small" 
            danger 
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${record.first_name} ${record.last_name}?`)) {
                handleDelete(record.member_id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];
  
  // Table columns for activities
  const activityColumns: TableColumnType[] = [
    {
      title: 'Date',
      dataIndex: 'activity_date',
      key: 'activity_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Type',
      dataIndex: 'activity_type',
      key: 'activity_type',
      render: (type: string) => type.replace('_', ' ').toUpperCase(),
    },
    {
      title: 'Points',
      dataIndex: 'points_earned',
      key: 'points_earned',
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
    },
  ];
  
  // Table columns for expiring memberships
  const expiringColumns: TableColumnType[] = [
    {
      title: 'Name',
      key: 'name',
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          onClick={() => showMemberProfile(record.member_id)}
          style={{ padding: 0 }}
        >
          {record.first_name} {record.last_name}
        </Button>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Expiration',
      dataIndex: 'expiration_date',
      key: 'expiration_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Days Left',
      dataIndex: 'days_remaining',
      key: 'days_remaining',
      render: (days: number) => (
        <Tag color={days < 7 ? 'red' : days < 14 ? 'orange' : 'green'}>
          {days} days
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button 
          size="small" 
          type="primary" 
          onClick={() => showEditModal(record as Member)}
        >
          Renew
        </Button>
      ),
    },
  ];
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Membership Management</h1>
        <Button type="primary" onClick={showAddModal}>Add New Member</Button>
      </div>
      
      <Tabs defaultActiveKey="1">
        <TabPane tab="Members" key="1">
          <Table 
            columns={columns} 
            dataSource={members} 
            rowKey="member_id" 
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
          />
        </TabPane>
        
        <TabPane tab="Expiring Memberships" key="2">
          <Table 
            columns={expiringColumns} 
            dataSource={expiringMembers} 
            rowKey="member_id" 
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        
        <TabPane tab="Statistics" key="3">
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <Statistic
                  title="Total Members"
                  value={stats.overall.totalMembers}
                  prefix={<UserOutlined />}
                />
              </Card>
              <Card>
                <Statistic
                  title="Total Points"
                  value={stats.overall.totalPoints}
                  prefix={<TrophyOutlined />}
                />
              </Card>
              <Card>
                <Statistic
                  title="Average Points"
                  value={stats.overall.avgPoints}
                  precision={2}
                  prefix={<TeamOutlined />}
                />
              </Card>
              <Card>
                <Statistic
                  title="Expiring Soon"
                  value={expiringMembers.length}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </div>
          ) : (
            <Spin size="large" />
          )}
          
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Members by Type">
                <Table 
                  dataSource={stats.byType} 
                  rowKey="membershipType"
                  pagination={false}
                  columns={[
                    {
                      title: 'Type',
                      dataIndex: 'membershipType',
                      key: 'membershipType',
                    },
                    {
                      title: 'Count',
                      dataIndex: 'memberCount',
                      key: 'memberCount',
                    },
                    {
                      title: 'Total Points',
                      dataIndex: 'totalPoints',
                      key: 'totalPoints',
                    },
                    {
                      title: 'Avg Points',
                      dataIndex: 'avgPoints',
                      key: 'avgPoints',
                      render: (points: number) => points.toFixed(2),
                    },
                  ]}
                />
              </Card>
              
              <Card title="Members by Status">
                <Table 
                  dataSource={stats.byStatus} 
                  rowKey="status"
                  pagination={false}
                  columns={[
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: string) => {
                        let color = 'green';
                        if (status === 'expiring') color = 'orange';
                        if (status === 'expired') color = 'red';
                        if (status === 'suspended') color = 'volcano';
                        return <Tag color={color}>{status.toUpperCase()}</Tag>;
                      },
                    },
                    {
                      title: 'Count',
                      dataIndex: 'memberCount',
                      key: 'memberCount',
                    },
                  ]}
                />
              </Card>
            </div>
          )}
        </TabPane>
      </Tabs>
      
      {/* Member Form Modal */}
      <Modal
        title={modalMode === 'add' ? 'Add New Member' : 'Edit Member'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ country: 'United States', status: 'active', points: 0 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="first_name"
              label="First Name"
              rules={[{ required: true, message: 'Please enter first name' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter last name' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="phone"
              label="Phone"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="address_line1"
              label="Address Line 1"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="address_line2"
              label="Address Line 2"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="city"
              label="City"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="state"
              label="State"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="postal_code"
              label="Postal Code"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="country"
              label="Country"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="membership_type"
              label="Membership Type"
              rules={[{ required: true, message: 'Please select membership type' }]}
            >
              <Select>
                {membershipTypes.map(type => (
                  <Option key={type.type_name} value={type.type_name}>
                    {type.type_name} (${type.monthly_fee}/month)
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select>
                <Option value="active">Active</Option>
                <Option value="expiring">Expiring</Option>
                <Option value="expired">Expired</Option>
                <Option value="suspended">Suspended</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="join_date"
              label="Join Date"
              rules={[{ required: true, message: 'Please select join date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="expiration_date"
              label="Expiration Date"
              rules={[{ required: true, message: 'Please select expiration date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="points"
              label="Points"
            >
              <Input type="number" min={0} />
            </Form.Item>
            
            <Form.Item
              name="referral_source"
              label="Referral Source"
            >
              <Input />
            </Form.Item>
          </div>
          
          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Member Profile Modal */}
      <Modal
        title="Member Profile"
        open={isProfileModalVisible}
        onCancel={handleProfileCancel}
        footer={[
          <Button key="close" onClick={handleProfileCancel}>
            Close
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            onClick={() => {
              if (selectedMember) {
                handleProfileCancel();
                showEditModal(selectedMember);
              }
            }}
          >
            Edit Profile
          </Button>
        ]}
        width={800}
      >
        {selectedMember ? (
          <div className="my-4">
            <Tabs defaultActiveKey="1">
              <TabPane tab="Personal Information" key="1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 mb-1">First Name</p>
                    <p className="font-medium">{selectedMember.first_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Last Name</p>
                    <p className="font-medium">{selectedMember.last_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Email</p>
                    <p className="font-medium">{selectedMember.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Phone</p>
                    <p className="font-medium">{selectedMember.phone || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 mb-1">Address</p>
                    <p className="font-medium">
                      {selectedMember.address_line1 || 'Not provided'}
                      {selectedMember.address_line2 && <span>, {selectedMember.address_line2}</span>}
                    </p>
                    <p className="font-medium">
                      {selectedMember.city && <span>{selectedMember.city}, </span>}
                      {selectedMember.state && <span>{selectedMember.state} </span>}
                      {selectedMember.postal_code && <span>{selectedMember.postal_code}</span>}
                    </p>
                    <p className="font-medium">{selectedMember.country}</p>
                  </div>
                </div>
              </TabPane>
              <TabPane tab="Membership Details" key="2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <Statistic
                      title="Membership Type"
                      value={selectedMember.membership_type}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                  <Card>
                    <Statistic
                      title="Points Balance"
                      value={selectedMember.points}
                      precision={0}
                      valueStyle={{ color: '#3f8600' }}
                      prefix={<TrophyOutlined />}
                    />
                  </Card>
                  <Card>
                    <Statistic
                      title="Join Date"
                      value={dayjs(selectedMember.join_date).format('MMM D, YYYY')}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                  <Card>
                    <Statistic
                      title="Expiration Date"
                      value={dayjs(selectedMember.expiration_date).format('MMM D, YYYY')}
                      valueStyle={{ 
                        color: dayjs().isAfter(selectedMember.expiration_date) ? '#cf1322' : 
                              dayjs().add(30, 'day').isAfter(selectedMember.expiration_date) ? '#fa8c16' : '#3f8600'
                      }}
                    />
                  </Card>
                </div>
                <div className="mb-4">
                  <p className="text-gray-500 mb-1">Status</p>
                  <Tag color={
                    selectedMember.status === 'active' ? 'green' : 
                    selectedMember.status === 'expiring' ? 'orange' :
                    selectedMember.status === 'expired' ? 'red' : 'volcano'
                  }>
                    {selectedMember.status.toUpperCase()}
                  </Tag>
                </div>
                <div className="mb-4">
                  <p className="text-gray-500 mb-1">Referral Source</p>
                  <p className="font-medium">{selectedMember.referral_source || 'Not specified'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-500 mb-1">Last Login</p>
                  <p className="font-medium">
                    {selectedMember.last_login ? dayjs(selectedMember.last_login).format('YYYY-MM-DD HH:mm:ss') : 'Never logged in'}
                  </p>
                </div>
              </TabPane>
              <TabPane tab="Activities" key="3">
                <Button 
                  type="primary" 
                  className="mb-4" 
                  onClick={() => {
                    handleProfileCancel();
                    showActivityModal(selectedMember.member_id);
                  }}
                >
                  Manage Activities
                </Button>
                <Table 
                  columns={activityColumns} 
                  dataSource={activities} 
                  rowKey="log_id" 
                  pagination={{ pageSize: 5 }}
                  loading={activities.length === 0}
                />
              </TabPane>
              <TabPane tab="Notes" key="4">
                <div className="mb-4">
                  <p className="text-gray-500 mb-1">Notes</p>
                  {selectedMember.notes ? (
                    <p className="whitespace-pre-wrap">{selectedMember.notes}</p>
                  ) : (
                    <p className="text-gray-400 italic">No notes available</p>
                  )}
                </div>
              </TabPane>
            </Tabs>
          </div>
        ) : (
          <div className="flex justify-center items-center my-8">
            <Spin size="large" />
          </div>
        )}
      </Modal>
      
      {/* Activity Modal */}
      <Modal
        title="Member Activities"
        open={isActivityModalVisible}
        onCancel={handleActivityCancel}
        footer={null}
        width={800}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Activity History" key="1">
            <Table 
              columns={activityColumns} 
              dataSource={activities} 
              rowKey="log_id" 
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          
          <TabPane tab="Add Activity" key="2">
            <Form
              form={activityForm}
              layout="vertical"
              onFinish={handleActivitySubmit}
            >
              <Form.Item
                name="activity_type"
                label="Activity Type"
                rules={[{ required: true, message: 'Please select activity type' }]}
              >
                <Select>
                  <Option value="event_attendance">Event Attendance</Option>
                  <Option value="purchase">Purchase</Option>
                  <Option value="referral">Referral</Option>
                  <Option value="login">Login</Option>
                  <Option value="webinar">Webinar</Option>
                  <Option value="volunteer">Volunteer</Option>
                  <Option value="renewal">Renewal</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="activity_date"
                label="Activity Date"
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="points_earned"
                label="Points Earned"
                rules={[{ required: true, message: 'Please enter points earned' }]}
              >
                <Input type="number" min={0} />
              </Form.Item>
              
              <Form.Item
                name="details"
                label="Details"
              >
                <Input.TextArea rows={4} />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Add Activity
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default Membership;
