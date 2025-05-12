import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import MedicalLayout from './MedicalLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faCalendar, faSearch, faDownload,
  faFileInvoiceDollar, faUserMd, faClinicMedical, faDollarSign,
  faFilter, faSort, faCheck, faTimes, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { PieChart, Pie as RechartsPie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

// Types
interface Provider {
  id: string;
  name: string;
  specialty: string;
}

interface Location {
  id: string;
  name: string;
}

interface Service {
  id: string;
  code: string;
  description: string;
  fee: number;
  category: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

interface Production {
  id: string;
  date: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  locationId: string;
  locationName: string;
  serviceId: string;
  serviceCode: string;
  serviceDescription: string;
  fee: number;
  adjustments: number;
  netFee: number;
  status: 'completed' | 'billed' | 'paid' | 'adjusted' | 'uncollectible';
  insuranceCoverage?: number;
  patientPortion?: number;
  insuranceStatus?: 'pending' | 'submitted' | 'paid' | 'denied' | 'appealed';
  paymentDate?: string;
  insuranceId?: string;
  insuranceName?: string;
}

interface FinancialSummary {
  totalProduction: number;
  totalCollections: number;
  totalAdjustments: number;
  insurancePayments: number;
  patientPayments: number;
  outstandingBalance: number;
  insurancePending: number;
  collectionRate: number;
}

// Mock data
const mockProviders: Provider[] = [
  { id: 'prov1', name: 'Dr. John Smith', specialty: 'General' },
  { id: 'prov2', name: 'Dr. Emily Johnson', specialty: 'Cardiology' },
  { id: 'prov3', name: 'Dr. Michael Brown', specialty: 'Orthopedics' },
  { id: 'prov4', name: 'Dr. Sarah Wilson', specialty: 'Pediatrics' }
];

const mockLocations: Location[] = [
  { id: 'loc1', name: 'Main Clinic' },
  { id: 'loc2', name: 'Downtown Office' },
  { id: 'loc3', name: 'Westside Branch' }
];

const mockServices: Service[] = [
  { id: 'serv1', code: 'E1001', description: 'New Patient Exam', fee: 150, category: 'Exam' },
  { id: 'serv2', code: 'E1002', description: 'Recall Exam', fee: 100, category: 'Exam' },
  { id: 'serv3', code: 'P2001', description: 'Standard Cleaning', fee: 120, category: 'Preventive' },
  { id: 'serv4', code: 'P2002', description: 'Deep Cleaning', fee: 250, category: 'Preventive' },
  { id: 'serv5', code: 'R3001', description: 'Composite Filling', fee: 200, category: 'Restorative' },
  { id: 'serv6', code: 'R3002', description: 'Crown', fee: 1200, category: 'Restorative' },
  { id: 'serv7', code: 'S4001', description: 'Tooth Extraction', fee: 250, category: 'Surgical' },
  { id: 'serv8', code: 'S4002', description: 'Root Canal', fee: 900, category: 'Surgical' }
];

const mockProductions: Production[] = [
  {
    id: 'prod1',
    date: '2025-05-05',
    patientId: 'pat1',
    patientName: 'Robert Anderson',
    providerId: 'prov1',
    providerName: 'Dr. John Smith',
    locationId: 'loc1',
    locationName: 'Main Clinic',
    serviceId: 'serv1',
    serviceCode: 'E1001',
    serviceDescription: 'New Patient Exam',
    fee: 150,
    adjustments: 0,
    netFee: 150,
    status: 'paid',
    insuranceCoverage: 120,
    patientPortion: 30,
    insuranceStatus: 'paid',
    paymentDate: '2025-05-10',
    insuranceId: 'ins1',
    insuranceName: 'Blue Cross'
  },
  {
    id: 'prod2',
    date: '2025-05-05',
    patientId: 'pat1',
    patientName: 'Robert Anderson',
    providerId: 'prov1',
    providerName: 'Dr. John Smith',
    locationId: 'loc1',
    locationName: 'Main Clinic',
    serviceId: 'serv3',
    serviceCode: 'P2001',
    serviceDescription: 'Standard Cleaning',
    fee: 120,
    adjustments: 0,
    netFee: 120,
    status: 'paid',
    insuranceCoverage: 120,
    patientPortion: 0,
    insuranceStatus: 'paid',
    paymentDate: '2025-05-10',
    insuranceId: 'ins1',
    insuranceName: 'Blue Cross'
  },
  {
    id: 'prod3',
    date: '2025-05-06',
    patientId: 'pat2',
    patientName: 'Jennifer Taylor',
    providerId: 'prov2',
    providerName: 'Dr. Emily Johnson',
    locationId: 'loc1',
    locationName: 'Main Clinic',
    serviceId: 'serv4',
    serviceCode: 'P2002',
    serviceDescription: 'Deep Cleaning',
    fee: 250,
    adjustments: 0,
    netFee: 250,
    status: 'billed',
    insuranceCoverage: 175,
    patientPortion: 75,
    insuranceStatus: 'submitted',
    insuranceId: 'ins2',
    insuranceName: 'Aetna'
  },
  {
    id: 'prod4',
    date: '2025-05-06',
    patientId: 'pat3',
    patientName: 'Michael Brown',
    providerId: 'prov1',
    providerName: 'Dr. John Smith',
    locationId: 'loc1',
    locationName: 'Main Clinic',
    serviceId: 'serv5',
    serviceCode: 'R3001',
    serviceDescription: 'Composite Filling',
    fee: 200,
    adjustments: 20,
    netFee: 180,
    status: 'paid',
    insuranceCoverage: 144,
    patientPortion: 36,
    insuranceStatus: 'paid',
    paymentDate: '2025-05-12',
    insuranceId: 'ins3',
    insuranceName: 'Delta Dental'
  },
  {
    id: 'prod5',
    date: '2025-05-07',
    patientId: 'pat4',
    patientName: 'Elizabeth Johnson',
    providerId: 'prov3',
    providerName: 'Dr. Michael Brown',
    locationId: 'loc2',
    locationName: 'Downtown Office',
    serviceId: 'serv6',
    serviceCode: 'R3002',
    serviceDescription: 'Crown',
    fee: 1200,
    adjustments: 200,
    netFee: 1000,
    status: 'billed',
    insuranceCoverage: 500,
    patientPortion: 500,
    insuranceStatus: 'pending',
    insuranceId: 'ins4',
    insuranceName: 'Cigna'
  },
  {
    id: 'prod6',
    date: '2025-05-08',
    patientId: 'pat2',
    patientName: 'Jennifer Taylor',
    providerId: 'prov2',
    providerName: 'Dr. Emily Johnson',
    locationId: 'loc1',
    locationName: 'Main Clinic',
    serviceId: 'serv8',
    serviceCode: 'S4002',
    serviceDescription: 'Root Canal',
    fee: 900,
    adjustments: 100,
    netFee: 800,
    status: 'billed',
    insuranceCoverage: 400,
    patientPortion: 400,
    insuranceStatus: 'submitted',
    insuranceId: 'ins2',
    insuranceName: 'Aetna'
  },
  {
    id: 'prod7',
    date: '2025-05-09',
    patientId: 'pat5',
    patientName: 'William Davis',
    providerId: 'prov4',
    providerName: 'Dr. Sarah Wilson',
    locationId: 'loc3',
    locationName: 'Westside Branch',
    serviceId: 'serv2',
    serviceCode: 'E1002',
    serviceDescription: 'Recall Exam',
    fee: 100,
    adjustments: 0,
    netFee: 100,
    status: 'completed',
    insuranceCoverage: 80,
    patientPortion: 20,
    insuranceId: 'ins5',
    insuranceName: 'MetLife'
  }
];

const generateDailyData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      production: Math.floor(Math.random() * 3000) + 2000,
      collections: Math.floor(Math.random() * 2500) + 1500,
      adjustment: Math.floor(Math.random() * 500)
    });
  }
  
  return data;
};

const mockDailyData = generateDailyData(30);

const mockCategorySummary = [
  { name: 'Preventive', value: 370 },
  { name: 'Restorative', value: 1380 },
  { name: 'Surgical', value: 800 },
  { name: 'Exam', value: 250 }
];

const mockInsuranceSummary = [
  { name: 'Blue Cross', value: 270 },
  { name: 'Aetna', value: 575 },
  { name: 'Delta Dental', value: 180 },
  { name: 'Cigna', value: 500 },
  { name: 'MetLife', value: 80 }
];

const ITEMS_PER_PAGE = 10;

const ProductionTrackingView: React.FC = () => {
  const [productions, setProductions] = useState<Production[]>(mockProductions);
  const [currentPage, setCurrentPage] = useState(1);
  const [dailyData, setDailyData] = useState(() => {
    // Dynamic data sampling based on dataset size
    const sampleRate = Math.max(1, Math.floor(mockDailyData.length / 50)); // Keep around 50 points max
    return mockDailyData.filter((_, index) => index % sampleRate === 0);
  });
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [providerFilter, setProviderFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [summary, setSummary] = useState<FinancialSummary>({
    totalProduction: 0,
    totalCollections: 0,
    totalAdjustments: 0,
    insurancePayments: 0,
    patientPayments: 0,
    outstandingBalance: 0,
    insurancePending: 0,
    collectionRate: 0
  });
  const [loading, setLoading] = useState<boolean>(false);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Memoized summary calculations
  // Memoize summary calculations to prevent unnecessary recalculation
  const calculateSummary = useMemo(() => {
    const paidProductions = productions.filter(prod => prod.status === 'paid');
    const pendingProductions = productions.filter(
      prod => prod.status === 'billed' || prod.status === 'completed'
    );
    const insurancePendingProductions = productions.filter(
      prod => prod.insuranceStatus === 'pending' || prod.insuranceStatus === 'submitted'
    );

    const summary = {
      totalProduction: productions.reduce((sum, prod) => sum + prod.fee, 0),
      totalAdjustments: productions.reduce((sum, prod) => sum + prod.adjustments, 0),
      totalCollections: paidProductions.reduce((sum, prod) => sum + prod.netFee, 0),
      insurancePayments: paidProductions.reduce((sum, prod) => sum + (prod.insuranceCoverage || 0), 0),
      patientPayments: paidProductions.reduce((sum, prod) => sum + (prod.patientPortion || 0), 0),
      outstandingBalance: pendingProductions.reduce((sum, prod) => sum + prod.netFee, 0),
      insurancePending: insurancePendingProductions.reduce((sum, prod) => sum + (prod.insuranceCoverage || 0), 0)
    };

    const netProduction = summary.totalProduction - summary.totalAdjustments;
    // Prevent division by zero
    const collectionRate = netProduction > 0 ? (summary.totalCollections / netProduction) * 100 : 0;

    return {
      ...summary,
      collectionRate
    };
  }, [productions]);

  useEffect(() => {
    setSummary(calculateSummary);
  }, [calculateSummary]);
  
  // Memoized filter and sort function
  const filteredProductions = useMemo(() => {
    let filtered = [...productions];
    
    if (debouncedSearch) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prod =>
        prod.patientName.toLowerCase().includes(query) ||
        prod.providerName.toLowerCase().includes(query) ||
        prod.serviceDescription.toLowerCase().includes(query) ||
        prod.serviceCode.toLowerCase().includes(query)
      );
    }
    
    if (providerFilter) {
      filtered = filtered.filter(prod => prod.providerId === providerFilter);
    }
    
    if (locationFilter) {
      filtered = filtered.filter(prod => prod.locationId === locationFilter);
    }
    
    if (statusFilter) {
      filtered = filtered.filter(prod => prod.status === statusFilter);
    }
    
    if (startDate && endDate) {
      filtered = filtered.filter(prod =>
        prod.date >= startDate && prod.date <= endDate
      );
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'patient':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'provider':
          comparison = a.providerName.localeCompare(b.providerName);
          break;
        case 'service':
          comparison = a.serviceDescription.localeCompare(b.serviceDescription);
          break;
        case 'fee':
          comparison = a.fee - b.fee;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = a.date.localeCompare(b.date);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [
    productions,
    searchQuery,
    providerFilter,
    locationFilter,
    statusFilter,
    startDate,
    endDate,
    sortBy,
    sortDirection
  ]);
  
  // Handle date range change
  const handleDateRangeChange = (range: 'today' | 'week' | 'month' | 'year' | 'custom') => {
    setDateRange(range);
    
    const today = new Date();
    let start = new Date();
    
    switch (range) {
      case 'today':
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'week':
        start.setDate(today.getDate() - 7);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'custom':
        // Don't change dates for custom, let user pick them
        break;
    }
  };
  
  // Handler functions
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Update filtered productions based on debounced search
  useEffect(() => {
    // This effect now only runs when the debounced search value changes
    setCurrentPage(1); // Reset to first page when search changes
  }, [debouncedSearch]);
  
  const handleProviderFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProviderFilter(e.target.value);
  };
  
  const handleLocationFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocationFilter(e.target.value);
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    // Validate start date is not after end date
    if (endDate && newStartDate > endDate) {
      alert('Start date cannot be after end date');
      return;
    }
    // Validate not future date
    if (newStartDate > new Date().toISOString().split('T')[0]) {
      alert('Start date cannot be in the future');
      return;
    }
    setStartDate(newStartDate);
    setDateRange('custom');
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    // Validate end date is not before start date
    if (startDate && newEndDate < startDate) {
      alert('End date cannot be before start date');
      return;
    }
    // Validate not future date
    if (newEndDate > new Date().toISOString().split('T')[0]) {
      alert('End date cannot be in the future');
      return;
    }
    setEndDate(newEndDate);
    setDateRange('custom');
  };
  
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  // Memoized formatter functions
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }, []);
  
  const formatDate = useCallback((dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  // Memoized chart components
  // Memoize gradient definitions to prevent re-renders
  const chartGradients = useMemo(() => (
    <defs>
      <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
      </linearGradient>
    </defs>
  ), []); // Empty dependency array as gradients never change

  const ProductionChart = useMemo(() => {
    const labels = dailyData.map(d => d.date);
    const data = {
      labels,
      datasets: [
        {
          label: 'Production',
          data: dailyData.map(d => d.production),
          borderColor: '#0088FE',
          fill: false
        },
        {
          label: 'Collections',
          data: dailyData.map(d => d.collections),
          borderColor: '#00C49F',
          fill: false
        },
        {
          label: 'Adjustments',
          data: dailyData.map(d => d.adjustment),
          borderColor: '#FF8042',
          fill: false
        }
      ]
    };

    return (
      <Line
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: 'Production & Collections Trend'
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Amount ($)'
              }
            }
          }
        }}
        aria-label="Production and Collections Trend Chart"
      />
    );
  }, [dailyData, formatCurrency]);

  const CategoryPieChart = useMemo(() => (
    <PieChart width={300} height={200} aria-label="Production by Category Chart">
      <Pie
        data={mockCategorySummary}
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        nameKey="name"
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        aria-label="Category distribution"
      >
        {mockCategorySummary.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
            aria-label={`${entry.name}: ${formatCurrency(entry.value)}`}
          />
        ))}
      </Pie>
      <Tooltip
        formatter={(value) => formatCurrency(Number(value))}
        wrapperStyle={{ outline: 'none' }}
        aria-label="Category details"
      />
    </PieChart>
  ), [mockCategorySummary, COLORS, formatCurrency]);

  const InsurancePieChart = useMemo(() => (
    <PieChart width={300} height={200} aria-label="Insurance Distribution Chart">
      <Pie
        data={mockInsuranceSummary}
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        nameKey="name"
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        aria-label="Insurance distribution"
      >
        {mockInsuranceSummary.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
            aria-label={`${entry.name}: ${formatCurrency(entry.value)}`}
          />
        ))}
      </Pie>
      <Tooltip
        formatter={(value) => formatCurrency(Number(value))}
        wrapperStyle={{ outline: 'none' }}
        aria-label="Insurance details"
      />
    </PieChart>
  ), [mockInsuranceSummary, COLORS, formatCurrency]);
  
  const renderStatusBadge = useCallback((status: Production['status']) => {
    let bgColor = '';
    let textColor = '';
    
    switch(status) {
      case 'completed':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'billed':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'paid':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'adjusted':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'uncollectible':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }, []);
  
  return (
    <MedicalLayout title="Production & Collections - KYNSEY MD">
      <div className="container mx-auto px-4 py-6" role="main" aria-label="Production tracking dashboard">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0" tabIndex={0}>
            Production & Collections Tracking
          </h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => console.log('Export data to CSV/Excel')}
              className="btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
              aria-label="Export data"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" aria-hidden="true" />
              Export
            </button>
          </div>
        </div>
        
        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDateRangeChange('today')}
                  className={`px-3 py-1 text-sm rounded ${dateRange === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                >
                  Today
                </button>
                <button
                  onClick={() => handleDateRangeChange('week')}
                  className={`px-3 py-1 text-sm rounded ${dateRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                >
                  Week
                </button>
                <button
                  onClick={() => handleDateRangeChange('month')}
                  className={`px-3 py-1 text-sm rounded ${dateRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                >
                  Month
                </button>
                <button
                  onClick={() => handleDateRangeChange('year')}
                  className={`px-3 py-1 text-sm rounded ${dateRange === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                >
                  Year
                </button>
                <button
                  onClick={() => handleDateRangeChange('custom')}
                  className={`px-3 py-1 text-sm rounded ${dateRange === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                >
                  Custom
                </button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="border border-gray-300 rounded-md px-3 py-1"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="border border-gray-300 rounded-md px-3 py-1"
                  value={endDate}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Total Production
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {formatCurrency(summary.totalProduction)}
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Net: {formatCurrency(summary.totalProduction - summary.totalAdjustments)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Collections
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {formatCurrency(summary.totalCollections)}
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faDollarSign} className="text-green-600" />
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Collection Rate: {summary.collectionRate.toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Outstanding Balance
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {formatCurrency(summary.outstandingBalance)}
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600" />
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Insurance Pending: {formatCurrency(summary.insurancePending)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Adjustments
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {formatCurrency(summary.totalAdjustments)}
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faTimes} className="text-red-600" />
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {((summary.totalAdjustments / summary.totalProduction) * 100).toFixed(1)}% of production
            </div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Production vs Collections Trend */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Production & Collections Trend</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                {ProductionChart}
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Production by Category & Insurance Distribution */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-4">Production by Category</h2>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    {CategoryPieChart}
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-4">Insurance Distribution</h2>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    {InsurancePieChart}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6" role="search">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Productions
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="search"
                  id="search"
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3"
                  placeholder="Search by patient, provider, or service..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Search productions"
                  aria-describedby="search-desc"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="providerFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <select
                id="providerFilter"
                className="w-full border border-gray-300 rounded-md py-2 px-3"
                value={providerFilter}
                onChange={handleProviderFilterChange}
              >
                <option value="">All Providers</option>
                {mockProviders.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="locationFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                id="locationFilter"
                className="w-full border border-gray-300 rounded-md py-2 px-3"
                value={locationFilter}
                onChange={handleLocationFilterChange}
              >
                <option value="">All Locations</option>
                {mockLocations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                className="w-full border border-gray-300 rounded-md py-2 px-3"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="billed">Billed</option>
                <option value="paid">Paid</option>
                <option value="adjusted">Adjusted</option>
                <option value="uncollectible">Uncollectible</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setSearchQuery('');
                setProviderFilter('');
                setLocationFilter('');
                setStatusFilter('');
              }}
              className="text-blue-600 hover:underline text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        {/* Production Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table
              className="min-w-full divide-y divide-gray-200"
              role="grid"
              aria-label="Production records"
            >
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('date')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === 'date' && (
                        <FontAwesomeIcon 
                          icon={faSort} 
                          className="ml-1" 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('patient')}
                  >
                    <div className="flex items-center">
                      Patient
                      {sortBy === 'patient' && (
                        <FontAwesomeIcon 
                          icon={faSort} 
                          className="ml-1" 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('provider')}
                  >
                    <div className="flex items-center">
                      Provider
                      {sortBy === 'provider' && (
                        <FontAwesomeIcon 
                          icon={faSort} 
                          className="ml-1" 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('service')}
                  >
                    <div className="flex items-center">
                      Service
                      {sortBy === 'service' && (
                        <FontAwesomeIcon 
                          icon={faSort} 
                          className="ml-1" 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('fee')}
                  >
                    <div className="flex items-center justify-end">
                      Fee
                      {sortBy === 'fee' && (
                        <FontAwesomeIcon 
                          icon={faSort}
                          className="ml-1" 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Adjustments
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Net
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('status')}
                  >
                    <div className="flex items-center justify-center">
                      Status
                      {sortBy === 'status' && (
                        <FontAwesomeIcon 
                          icon={faSort} 
                          className="ml-1" 
                        />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProductions.length > 0 ? (
                  // Only slice the data we need for the current page
                  filteredProductions
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((prod) => (
                    <tr key={prod.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(prod.date)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{prod.patientName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{prod.providerName}</div>
                        <div className="text-xs text-gray-500">{prod.locationName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{prod.serviceDescription}</div>
                        <div className="text-xs text-gray-500">{prod.serviceCode}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm text-gray-900">{formatCurrency(prod.fee)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm text-red-600">
                          {prod.adjustments > 0 ? `(${formatCurrency(prod.adjustments)})` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(prod.netFee)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {renderStatusBadge(prod.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                      role="alert"
                      aria-live="polite"
                    >
                      No production records found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer / Pagination */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between items-center">
              <div className="flex items-center justify-between">
                <p
                  className="text-sm text-gray-700"
                  role="status"
                  aria-live="polite"
                >
                  Showing{' '}
                  <span className="font-medium">
                    {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProductions.length)}
                  </span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredProductions.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{filteredProductions.length}</span> records
                </p>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                      currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredProductions.length / ITEMS_PER_PAGE), p + 1))}
                    disabled={currentPage >= Math.ceil(filteredProductions.length / ITEMS_PER_PAGE)}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                      currentPage >= Math.ceil(filteredProductions.length / ITEMS_PER_PAGE) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MedicalLayout>
  );
};

export default ProductionTrackingView;
