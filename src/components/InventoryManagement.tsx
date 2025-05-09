import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, 
  AreaChart, Area 
} from 'recharts';
import { 
  getMembers, 
  getMemberStatusSummary, 
  getMembershipTypeSummary, 
  getExpiringMemberships, 
  getMemberEngagement, 
  getRecentActivities,
  addMemberUpdateListener,
  removeMemberUpdateListener,
  type Member,
  type MemberStatusSummary,
  type MembershipTypeSummary,
  type ExpiringMembership,
  type MemberEngagement,
  type MemberActivity
} from '../services/dataService';

const InventoryManagement: React.FC = () => {
  // State for data
  const [members, setMembers] = useState<Member[]>([]);
  const [memberStatusSummary, setMemberStatusSummary] = useState<MemberStatusSummary[]>([]);
  const [membershipTypeSummary, setMembershipTypeSummary] = useState<MembershipTypeSummary[]>([]);
  const [expiringMemberships, setExpiringMemberships] = useState<ExpiringMembership[]>([]);
  const [memberEngagement, setMemberEngagement] = useState<MemberEngagement[]>([]);
  const [recentActivities, setRecentActivities] = useState<MemberActivity[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMembershipType, setSelectedMembershipType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<string>('last_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Colors for the charts
  const COLORS = ['#7e57c2', '#4e7fff', '#b39ddb', '#64b5f6', '#9575cd', '#5c6bc0', '#7986cb', '#4fc3f7'];
  const STATUS_COLORS: Record<string, string> = {
    'active': '#4caf50',
    'expiring': '#ff9800',
    'expired': '#f44336',
    'suspended': '#9e9e9e',
    'cancelled': '#e57373'
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data
        const membersData = await getMembers();
        setMembers(membersData);
        
        const statusSummaryData = await getMemberStatusSummary();
        setMemberStatusSummary(statusSummaryData);
        
        const typeSummaryData = await getMembershipTypeSummary();
        setMembershipTypeSummary(typeSummaryData);
        
        const expiringData = await getExpiringMemberships();
        setExpiringMemberships(expiringData);
        
        const engagementData = await getMemberEngagement();
        setMemberEngagement(engagementData);
        
        const activitiesData = await getRecentActivities();
        setRecentActivities(activitiesData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Set up live update listeners
    const handleMemberUpdate = async (memberData: any) => {
      console.log('Member update received:', memberData);
      
      // Reload data to get the latest state
      try {
        const membersData = await getMembers();
        setMembers(membersData);
        
        const statusSummaryData = await getMemberStatusSummary();
        setMemberStatusSummary(statusSummaryData);
        
        const typeSummaryData = await getMembershipTypeSummary();
        setMembershipTypeSummary(typeSummaryData);
        
        const expiringData = await getExpiringMemberships();
        setExpiringMemberships(expiringData);
      } catch (error) {
        console.error('Error updating data after member change:', error);
      }
    };
    
    // Add listeners
    addMemberUpdateListener(handleMemberUpdate);
    
    // Clean up listeners on unmount
    return () => {
      removeMemberUpdateListener(handleMemberUpdate);
    };
  }, []);
  
  // Filter members based on selected filters and search query
  const filteredMembers = members.filter(member => {
    // Filter by status
    if (selectedStatus !== 'all' && member.status !== selectedStatus) {
      return false;
    }
    
    // Filter by membership type
    if (selectedMembershipType !== 'all' && member.membership_type !== selectedMembershipType) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        member.first_name.toLowerCase().includes(query) ||
        member.last_name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        (member.phone && member.phone.includes(query))
      );
    }
    
    return true;
  });
  
  // Sort filtered members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aValue: any = a[sortField as keyof Member];
    let bValue: any = b[sortField as keyof Member];
    
    // Handle null values
    if (aValue === null) aValue = '';
    if (bValue === null) bValue = '';
    
    // Convert to lowercase for string comparison
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Prepare data for charts
  const prepareMemberStatusData = () => {
    return memberStatusSummary.map((status: MemberStatusSummary) => ({
      status: status.status,
      count: status.member_count,
      points: status.total_points
    }));
  };
  
  const prepareMembershipTypeData = () => {
    return membershipTypeSummary.map((type: MembershipTypeSummary) => ({
      type: type.membership_type,
      count: type.member_count,
      points: type.total_points,
      monthly_fee: type.monthly_fee,
      annual_fee: type.annual_fee
    }));
  };
  
  const prepareExpiringMembershipsData = () => {
    // Group by days remaining
    const groups: Record<string, number> = {
      'This week': 0,
      '8-14 days': 0,
      '15-30 days': 0
    };
    
    expiringMemberships.forEach(member => {
      if (member.days_remaining <= 7) {
        groups['This week']++;
      } else if (member.days_remaining <= 14) {
        groups['8-14 days']++;
      } else {
        groups['15-30 days']++;
      }
    });
    
    return Object.entries(groups).map(([label, count]) => ({
      label,
      count
    }));
  };
  
  const prepareMemberEngagementData = () => {
    // Return top 10 most engaged members
    return memberEngagement.slice(0, 10).map(member => ({
      name: `${member.first_name} ${member.last_name}`,
      activities: member.total_activities,
      points: member.points,
      spent: member.total_spent,
      days: member.days_since_last_activity
    }));
  };
  
  // Handle sort change
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    // Total members
    const totalMembers = members.length;
    
    // Active members
    const activeMembers = members.filter(member => member.status === 'active').length;
    
    // Expiring soon (next 30 days)
    const expiringSoon = expiringMemberships.length;
    
    // Total points
    const totalPoints = members.reduce((sum, member) => sum + member.points, 0);
    
    return {
      totalMembers,
      activeMembers,
      expiringSoon,
      totalPoints
    };
  };
  
  if (isLoading) {
    return <div className="text-center p-10 text-dashboard-text">Loading data...</div>;
  }
  
  // Check if data is empty (PostgreSQL not linked yet)
  const isDataEmpty = members.length === 0;
  
  if (isDataEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dashboard-dark">
        <div className="text-center p-10 max-w-2xl">
          <h1 className="text-2xl font-medium text-dashboard-header mb-4">PostgreSQL Connection Required</h1>
          <p className="text-dashboard-text mb-6">
            The Membership Management system requires a connection to PostgreSQL to display data. 
            All sections will remain blank until the PostgreSQL directory is linked.
          </p>
          <div className="bg-dashboard-panel p-6 rounded-lg shadow-lg">
            <h2 className="text-xl text-dashboard-header mb-3">Setup Instructions:</h2>
            <ol className="text-dashboard-text list-decimal list-inside space-y-2 text-left">
              <li>Ensure PostgreSQL is installed and running on your system</li>
              <li>Configure your database connection in the .env file</li>
              <li>Run the setup scripts to create the database schema</li>
              <li>Link the PostgreSQL directory to enable data access</li>
              <li>Restart the application to load the data</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate summary metrics
  const summaryMetrics = calculateSummaryMetrics();
  
  // Get unique membership types for filter
  const membershipTypes = ['all', ...new Set(members.map(member => member.membership_type))];

  return (
    <div className="p-4">
      <div className="mb-4 px-2 flex justify-between items-center">
        <h1 className="text-xl font-medium text-dashboard-header">Membership Management</h1>
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="statusSelect" className="text-dashboard-subtext mr-2 text-sm">Status:</label>
            <select 
              id="statusSelect"
              className="bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-2 py-1 text-sm"
              value={selectedStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label htmlFor="typeSelect" className="text-dashboard-subtext mr-2 text-sm">Type:</label>
            <select 
              id="typeSelect"
              className="bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-2 py-1 text-sm"
              value={selectedMembershipType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMembershipType(e.target.value)}
            >
              {membershipTypes.map((type) => (
                <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search members..."
              className="bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-2 py-1 text-sm"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-subtext text-sm mb-1">Total Members</h2>
          <p className="text-dashboard-header text-2xl">{summaryMetrics.totalMembers}</p>
        </div>
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-subtext text-sm mb-1">Active Members</h2>
          <p className="text-dashboard-header text-2xl">{summaryMetrics.activeMembers}</p>
        </div>
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-subtext text-sm mb-1">Expiring Soon</h2>
          <p className="text-dashboard-header text-2xl">{summaryMetrics.expiringSoon}</p>
        </div>
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-subtext text-sm mb-1">Total Points</h2>
          <p className="text-dashboard-header text-2xl">{summaryMetrics.totalPoints.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Member Status Panel */}
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-4">Member Status</h2>
          
          <div className="mb-4">
            <h3 className="text-dashboard-subtext text-sm mb-2">Status Distribution</h3>
            {prepareMemberStatusData().length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={prepareMemberStatusData()}>
                  <XAxis dataKey="status" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                    labelStyle={{ color: '#e0e0e0' }}
                  />
                  <Bar dataKey="count" name="Members">
                    {prepareMemberStatusData().map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] bg-dashboard-dark rounded">
                <p className="text-dashboard-subtext">No data available</p>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="text-dashboard-subtext text-sm mb-2">Expiring Memberships</h3>
            {prepareExpiringMembershipsData().length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={prepareExpiringMembershipsData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="label"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {prepareExpiringMembershipsData().map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => `${value} members`}
                    contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                    labelStyle={{ color: '#e0e0e0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] bg-dashboard-dark rounded">
                <p className="text-dashboard-subtext">No data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Membership Types Panel */}
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-4">Membership Types</h2>
          
          <div className="mb-4">
            <h3 className="text-dashboard-subtext text-sm mb-2">Type Distribution</h3>
            {prepareMembershipTypeData().length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={prepareMembershipTypeData()}>
                  <XAxis dataKey="type" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                    labelStyle={{ color: '#e0e0e0' }}
                  />
                  <Bar dataKey="count" name="Members">
                    {prepareMembershipTypeData().map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] bg-dashboard-dark rounded">
                <p className="text-dashboard-subtext">No data available</p>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="text-dashboard-subtext text-sm mb-2">Membership Fees</h3>
            <div className="bg-dashboard-dark rounded p-2">
              <table className="w-full text-dashboard-text text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2">Type</th>
                    <th className="text-right py-2">Monthly Fee</th>
                    <th className="text-right py-2">Annual Fee</th>
                    <th className="text-right py-2">Members</th>
                  </tr>
                </thead>
                <tbody>
                  {membershipTypeSummary.map((type: MembershipTypeSummary) => (
                    <tr key={type.membership_type}>
                      <td className="py-2">{type.membership_type}</td>
                      <td className="py-2 text-right">${type.monthly_fee.toFixed(2)}</td>
                      <td className="py-2 text-right">${type.annual_fee ? type.annual_fee.toFixed(2) : '-'}</td>
                      <td className="py-2 text-right">{type.member_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Member Engagement Panel */}
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-4">Member Engagement</h2>
          
          <div className="mb-4">
            <h3 className="text-dashboard-subtext text-sm mb-2">Top Engaged Members</h3>
            {prepareMemberEngagementData().length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={prepareMemberEngagementData()} layout="vertical">
                  <XAxis type="number" stroke="#666" />
                  <YAxis dataKey="name" type="category" width={100} stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                    labelStyle={{ color: '#e0e0e0' }}
                  />
                  <Bar dataKey="activities" name="Activities" fill="#4e7fff" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] bg-dashboard-dark rounded">
                <p className="text-dashboard-subtext">No data available</p>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="text-dashboard-subtext text-sm mb-2">Recent Activities</h3>
            <div className="bg-dashboard-dark rounded p-2 max-h-[200px] overflow-y-auto">
              <table className="w-full text-dashboard-text text-sm">
                <thead className="sticky top-0 bg-dashboard-dark">
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2">Member</th>
                    <th className="text-left py-2">Activity</th>
                    <th className="text-right py-2">Points</th>
                    <th className="text-right py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((activity: MemberActivity) => (
                    <tr key={activity.log_id}>
                      <td className="py-2">{activity.first_name} {activity.last_name}</td>
                      <td className="py-2">{activity.activity_type.replace('_', ' ')}</td>
                      <td className="py-2 text-right">{activity.points_earned}</td>
                      <td className="py-2 text-right">{new Date(activity.activity_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {recentActivities.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-dashboard-subtext">No recent activities</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Members Table */}
      <div className="bg-dashboard-panel rounded shadow p-4 mt-4">
        <h2 className="text-dashboard-header text-lg mb-4">Member Directory</h2>
        
        <div className="bg-dashboard-dark rounded p-2 overflow-x-auto">
          <table className="w-full text-dashboard-text text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th 
                  className="text-left py-2 px-2 cursor-pointer hover:text-white"
                  onClick={() => handleSortChange('last_name')}
                >
                  Name
                  {sortField === 'last_name' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="text-left py-2 px-2 cursor-pointer hover:text-white"
                  onClick={() => handleSortChange('email')}
                >
                  Email
                  {sortField === 'email' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="text-left py-2 px-2 cursor-pointer hover:text-white"
                  onClick={() => handleSortChange('membership_type')}
                >
                  Membership
                  {sortField === 'membership_type' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="text-left py-2 px-2 cursor-pointer hover:text-white"
                  onClick={() => handleSortChange('join_date')}
                >
                  Join Date
                  {sortField === 'join_date' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="text-left py-2 px-2 cursor-pointer hover:text-white"
                  onClick={() => handleSortChange('expiration_date')}
                >
                  Expiration
                  {sortField === 'expiration_date' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="text-left py-2 px-2 cursor-pointer hover:text-white"
                  onClick={() => handleSortChange('status')}
                >
                  Status
                  {sortField === 'status' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="text-right py-2 px-2 cursor-pointer hover:text-white"
                  onClick={() => handleSortChange('points')}
                >
                  Points
                  {sortField === 'points' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map((member: Member) => (
                <tr key={member.member_id} className="hover:bg-gray-800">
                  <td className="py-2 px-2">{member.first_name} {member.last_name}</td>
                  <td className="py-2 px-2">{member.email}</td>
                  <td className="py-2 px-2">{member.membership_type}</td>
                  <td className="py-2 px-2">{new Date(member.join_date).toLocaleDateString()}</td>
                  <td className="py-2 px-2">{new Date(member.expiration_date).toLocaleDateString()}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      member.status === 'active' ? 'bg-green-900 text-green-200' :
                      member.status === 'expiring' ? 'bg-yellow-900 text-yellow-200' :
                      member.status === 'expired' ? 'bg-red-900 text-red-200' :
                      member.status === 'suspended' ? 'bg-gray-700 text-gray-200' :
                      'bg-red-800 text-red-200'
                    }`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right">{member.points.toLocaleString()}</td>
                </tr>
              ))}
              {sortedMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-dashboard-subtext">No members found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-right text-dashboard-subtext text-sm">
          Showing {sortedMembers.length} of {members.length} members
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
